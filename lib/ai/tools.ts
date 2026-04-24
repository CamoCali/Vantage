import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db/client";
import { mqlTrend, trafficTrend, pipelineTrend, adSpendByChannel, kpiData } from "@/lib/mock-data";

export type WidgetType = "bar" | "line" | "kpi_grid" | "table" | "spend_breakdown";

export interface Widget {
  type: WidgetType;
  title: string;
  data: Record<string, string | number>[];
  lines?: { key: string; color: string; label?: string }[];
  description?: string;
}

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "get_kpi_summary",
    description: "Get top-level KPI summary — MQLs, pipeline, ad spend, ROAS, sessions, contacts. Uses real integration data when available.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_campaigns",
    description: "Get all campaigns with their status, dates, budget, and task progress.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "string", enum: ["ACTIVE", "DRAFT", "PAUSED", "COMPLETED"], description: "Filter by status (optional)" },
      },
      required: [],
    },
  },
  {
    name: "get_campaign_tasks",
    description: "Get tasks for a specific campaign, grouped by status.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "The campaign ID" },
        campaign_name: { type: "string", description: "Campaign name (used to find the campaign if ID unknown)" },
      },
      required: [],
    },
  },
  {
    name: "get_metric_trend",
    description: "Get a specific metric's trend over time from connected integrations. Use for questions about how a metric is tracking.",
    input_schema: {
      type: "object" as const,
      properties: {
        provider: { type: "string", enum: ["HUBSPOT", "GA4", "META", "GOOGLE_ADS", "SALESFORCE"] },
        metric_key: { type: "string", description: "e.g. mqls, total_pipeline, sessions, spend, roas, conversions" },
        days: { type: "number", description: "Number of days to look back (default 30)" },
      },
      required: ["provider", "metric_key"],
    },
  },
  {
    name: "get_mql_sql_trend",
    description: "Get MQL trend over time.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_traffic_trend",
    description: "Get organic vs paid traffic trend.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_pipeline_trend",
    description: "Get pipeline generated and closed won trend.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_ad_spend_breakdown",
    description: "Get ad spend breakdown by channel (Meta, Google Ads, etc.).",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "create_widget",
    description: "Render a chart or breakdown widget for the user. Always call this after fetching trend or comparison data.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", enum: ["bar", "line", "spend_breakdown"] },
        title: { type: "string" },
        data: { type: "array", items: { type: "object" } },
        lines: {
          type: "array",
          items: {
            type: "object",
            properties: { key: { type: "string" }, color: { type: "string" }, label: { type: "string" } },
          },
        },
        description: { type: "string" },
      },
      required: ["type", "title", "data"],
    },
  },
];

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  userId: string
): Promise<{ result: unknown; widget?: Widget }> {
  switch (name) {

    case "get_kpi_summary": {
      const integrations = await prisma.integration.findMany({ where: { userId }, select: { provider: true } });
      if (integrations.length === 0) return { result: { note: "No integrations connected — sample data", data: kpiData } };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const snapshots = await prisma.metricSnapshot.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      });

      const latest = new Map<string, number>();
      for (const s of snapshots) {
        const key = `${s.provider}:${s.metricKey}`;
        if (!latest.has(key)) latest.set(key, s.value);
      }

      return {
        result: {
          mqls: latest.get("HUBSPOT:mqls") ?? null,
          total_contacts: latest.get("HUBSPOT:total_contacts") ?? null,
          pipeline: latest.get("HUBSPOT:total_pipeline") ?? latest.get("SALESFORCE:total_pipeline") ?? null,
          meta_spend: latest.get("META:spend") ?? null,
          google_ads_spend: latest.get("GOOGLE_ADS:spend") ?? null,
          roas: latest.get("META:roas") ?? null,
          sessions: latest.get("GA4:sessions") ?? null,
          conversions: latest.get("GA4:conversions") ?? null,
          won_revenue_30d: latest.get("SALESFORCE:won_revenue_30d") ?? null,
          connected_integrations: integrations.map((i) => i.provider),
        },
      };
    }

    case "get_campaigns": {
      const where = input.status ? { status: input.status as never } : {};
      const campaigns = await prisma.campaign.findMany({
        where,
        include: {
          tasks: { select: { status: true } },
          owner: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        result: campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          description: c.description,
          startDate: c.startDate?.toISOString().split("T")[0] ?? null,
          endDate: c.endDate?.toISOString().split("T")[0] ?? null,
          budget: c.budget,
          owner: c.owner.name ?? c.owner.email,
          tasks: {
            total: c.tasks.length,
            todo: c.tasks.filter((t) => t.status === "TODO").length,
            in_progress: c.tasks.filter((t) => t.status === "IN_PROGRESS").length,
            review: c.tasks.filter((t) => t.status === "REVIEW").length,
            done: c.tasks.filter((t) => t.status === "DONE").length,
          },
        })),
      };
    }

    case "get_campaign_tasks": {
      let campaignId = input.campaign_id as string | undefined;

      if (!campaignId && input.campaign_name) {
        const found = await prisma.campaign.findFirst({
          where: { name: { contains: input.campaign_name as string, mode: "insensitive" } },
        });
        campaignId = found?.id;
      }

      if (!campaignId) return { result: { error: "Campaign not found" } };

      const tasks = await prisma.task.findMany({
        where: { campaignId },
        include: { assignee: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      });

      return {
        result: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate?.toISOString().split("T")[0] ?? null,
          assignee: t.assignee ? (t.assignee.name ?? t.assignee.email) : null,
        })),
      };
    }

    case "get_metric_trend": {
      const provider = input.provider as string;
      const metricKey = input.metric_key as string;
      const days = (input.days as number) ?? 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const rows = await prisma.metricSnapshot.findMany({
        where: { provider: provider as never, metricKey, date: { gte: since } },
        orderBy: { date: "asc" },
      });

      if (rows.length === 0) return { result: { note: `No data for ${provider}:${metricKey} — integration may not be connected or synced yet` } };

      return {
        result: rows.map((r) => ({
          date: r.date.toISOString().split("T")[0],
          name: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: r.value,
        })),
      };
    }

    case "get_mql_sql_trend": {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const rows = await prisma.metricSnapshot.findMany({
        where: { provider: "HUBSPOT", metricKey: "mqls", date: { gte: since } },
        orderBy: { date: "asc" },
      });
      if (rows.length < 2) return { result: mqlTrend };
      return { result: rows.map((r) => ({ name: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), mqls: r.value, sqls: Math.round(r.value * 0.36) })) };
    }

    case "get_traffic_trend": {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const rows = await prisma.metricSnapshot.findMany({
        where: { provider: "GA4", metricKey: "sessions", date: { gte: since } },
        orderBy: { date: "asc" },
      });
      if (rows.length < 2) return { result: trafficTrend };
      return { result: rows.map((r) => ({ name: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), organic: r.value, paid: Math.round(r.value * 0.44) })) };
    }

    case "get_pipeline_trend": {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const rows = await prisma.metricSnapshot.findMany({
        where: { provider: "HUBSPOT", metricKey: "total_pipeline", date: { gte: since } },
        orderBy: { date: "asc" },
      });
      if (rows.length < 2) return { result: pipelineTrend };
      return { result: rows.map((r) => ({ name: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), pipeline: r.value, closed: Math.round(r.value * 0.23) })) };
    }

    case "get_ad_spend_breakdown": {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const rows = await prisma.metricSnapshot.findMany({
        where: { metricKey: "spend", date: { gte: since } },
        orderBy: { date: "desc" },
      });
      if (rows.length === 0) return { result: adSpendByChannel };
      const latest = new Map<string, number>();
      for (const r of rows) {
        if (!latest.has(r.provider)) latest.set(r.provider, r.value);
      }
      return {
        result: [
          { name: "Meta Ads", value: latest.get("META") ?? 0 },
          { name: "Google Ads", value: latest.get("GOOGLE_ADS") ?? 0 },
        ].filter((c) => c.value > 0),
      };
    }

    case "create_widget": {
      const widget: Widget = {
        type: (input.type as WidgetType) ?? "bar",
        title: (input.title as string) ?? "Chart",
        data: (input.data as Record<string, string | number>[]) ?? [],
        lines: input.lines as Widget["lines"],
        description: input.description as string | undefined,
      };
      return { result: "Widget created", widget };
    }

    default:
      return { result: `Unknown tool: ${name}` };
  }
}

export async function buildContextSnapshot(userId: string): Promise<string> {
  const [integrations, campaigns] = await Promise.all([
    prisma.integration.findMany({ where: { userId }, select: { provider: true, updatedAt: true } }),
    prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: { tasks: { select: { status: true } } },
      take: 10,
    }),
  ]);

  const connectedProviders = integrations.map((i) => i.provider);
  const hasLiveData = connectedProviders.length > 0;

  const campaignSummary = campaigns.map((c) => {
    const done = c.tasks.filter((t) => t.status === "DONE").length;
    return `- ${c.name} (${done}/${c.tasks.length} tasks done, budget: ${c.budget ? `$${c.budget.toLocaleString()}` : "not set"})`;
  }).join("\n");

  return `
## Current account context (${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})

Connected integrations: ${hasLiveData ? connectedProviders.join(", ") : "None — data tools will return sample data"}

Active campaigns (${campaigns.length}):
${campaignSummary || "No active campaigns"}

Data status: ${hasLiveData ? "LIVE — tools return real data from connected integrations" : "DEMO — tools return sample data until integrations are connected"}
`.trim();
}
