import { prisma } from "@/lib/db/client";
import { kpiData, trafficTrend, pipelineTrend, mqlTrend } from "@/lib/mock-data";

type MetricRow = { provider: string; metricKey: string; value: number; date: Date };

function fmt(n: number, type: "currency" | "number" | "roas" | "percent" = "number") {
  if (type === "currency") {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n.toLocaleString()}`;
  }
  if (type === "roas") return `${n.toFixed(1)}x`;
  if (type === "percent") return `${n.toFixed(1)}%`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toLocaleString();
}

function latest(rows: MetricRow[], provider: string, key: string) {
  return rows
    .filter((r) => r.provider === provider && r.metricKey === key)
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.value ?? null;
}

function pctChange(current: number, previous: number | null) {
  if (previous === null || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export async function getDashboardData(userId: string) {
  const integrations = await prisma.integration.findMany({
    where: { userId },
    select: { provider: true, updatedAt: true },
  });
  const connected = new Set(integrations.map((i) => i.provider));
  const hasAny = connected.size > 0;

  if (!hasAny) {
    return { isDemo: true, kpis: buildMockKpis(), charts: buildMockCharts(), adSpend: buildMockAdSpend(), lastSynced: null };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rows: MetricRow[] = await prisma.metricSnapshot.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  }) as MetricRow[];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  function prev(provider: string, key: string) {
    return rows
      .filter((r) => r.provider === provider && r.metricKey === key && r.date <= sevenDaysAgo)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.value ?? null;
  }

  // --- KPIs ---
  const mqls = latest(rows, "HUBSPOT", "mqls");
  const pipeline = latest(rows, "HUBSPOT", "total_pipeline") ?? latest(rows, "SALESFORCE", "total_pipeline");
  const metaSpend = latest(rows, "META", "spend") ?? 0;
  const gadsSpend = latest(rows, "GOOGLE_ADS", "spend") ?? 0;
  const totalSpend = metaSpend + gadsSpend;
  const roas = latest(rows, "META", "roas");
  const sessions = latest(rows, "GA4", "sessions");
  const contacts = latest(rows, "HUBSPOT", "total_contacts");

  const kpis = [
    {
      title: "MQLs (Last 30d)",
      value: mqls !== null ? fmt(mqls) : kpiData[0].value,
      change: mqls !== null ? pctChange(mqls, prev("HUBSPOT", "mqls")) : kpiData[0].change,
      live: mqls !== null,
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      title: "Total Contacts",
      value: contacts !== null ? fmt(contacts) : kpiData[1].value,
      change: contacts !== null ? pctChange(contacts, prev("HUBSPOT", "total_contacts")) : kpiData[1].change,
      live: contacts !== null,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "Pipeline Value",
      value: pipeline !== null ? fmt(pipeline, "currency") : kpiData[2].value,
      change: pipeline !== null ? pctChange(pipeline, prev("HUBSPOT", "total_pipeline") ?? prev("SALESFORCE", "total_pipeline")) : kpiData[2].change,
      live: pipeline !== null,
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      title: "Total Ad Spend",
      value: totalSpend > 0 ? fmt(totalSpend, "currency") : kpiData[3].value,
      change: totalSpend > 0 ? pctChange(totalSpend, (prev("META", "spend") ?? 0) + (prev("GOOGLE_ADS", "spend") ?? 0)) : kpiData[3].change,
      live: totalSpend > 0,
      gradient: "from-orange-400 to-rose-500",
    },
    {
      title: "Blended ROAS",
      value: roas !== null ? fmt(roas, "roas") : kpiData[4].value,
      change: roas !== null ? pctChange(roas, prev("META", "roas")) : kpiData[4].change,
      live: roas !== null,
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      title: "Sessions (30d)",
      value: sessions !== null ? fmt(sessions) : kpiData[5].value,
      change: sessions !== null ? pctChange(sessions, prev("GA4", "sessions")) : kpiData[5].change,
      live: sessions !== null,
      gradient: "from-teal-400 to-cyan-500",
    },
  ];

  // --- Charts: build time series grouped by date label ---
  function timeSeries(provider: string, key: string) {
    return rows
      .filter((r) => r.provider === provider && r.metricKey === key)
      .map((r) => ({
        name: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: r.value,
        date: r.date,
      }));
  }

  const mqlSeries = timeSeries("HUBSPOT", "mqls");
  const pipelineSeries = timeSeries("HUBSPOT", "total_pipeline");
  const sessionsSeries = timeSeries("GA4", "sessions");

  const mqlChart = mqlSeries.length >= 2
    ? mqlSeries.map((d) => ({ name: d.name, mqls: d.value, sqls: Math.round(d.value * 0.36) }))
    : mqlTrend;

  const pipelineChart = pipelineSeries.length >= 2
    ? pipelineSeries.map((d) => ({ name: d.name, pipeline: d.value, closed: Math.round(d.value * 0.23) }))
    : pipelineTrend;

  const trafficChart = sessionsSeries.length >= 2
    ? sessionsSeries.map((d) => ({ name: d.name, organic: d.value, paid: Math.round(d.value * 0.44) }))
    : trafficTrend;

  // Ad spend breakdown
  const adSpend = totalSpend > 0
    ? [
        { name: "Meta Ads", value: metaSpend, total: totalSpend, color: "bg-indigo-500" },
        { name: "Google Ads", value: gadsSpend, total: totalSpend, color: "bg-violet-500" },
      ].filter((c) => c.value > 0)
    : buildMockAdSpend();

  const lastSynced = integrations.length > 0
    ? integrations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
    : null;

  const liveCount = kpis.filter((k) => k.live).length;

  return {
    isDemo: liveCount === 0,
    kpis,
    charts: { mql: mqlChart, pipeline: pipelineChart, traffic: trafficChart },
    adSpend,
    lastSynced,
  };
}

function buildMockKpis() {
  const gradients = [
    "from-indigo-500 to-violet-500", "from-violet-500 to-purple-600",
    "from-emerald-400 to-teal-500",  "from-orange-400 to-rose-500",
    "from-blue-400 to-indigo-500",   "from-teal-400 to-cyan-500",
  ];
  return kpiData.map((k, i) => ({ ...k, live: false, gradient: gradients[i] }));
}

function buildMockCharts() {
  return { mql: mqlTrend, pipeline: pipelineTrend, traffic: trafficTrend };
}

function buildMockAdSpend() {
  return [
    { name: "Meta Ads",    value: 18200, total: 42600, color: "bg-indigo-500" },
    { name: "Google Ads",  value: 14800, total: 42600, color: "bg-violet-500" },
    { name: "LinkedIn Ads",value: 6400,  total: 42600, color: "bg-blue-400" },
    { name: "Other",       value: 3200,  total: 42600, color: "bg-gray-300" },
  ];
}
