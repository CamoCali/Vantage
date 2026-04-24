import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { prisma } from "@/lib/db/client";

export async function syncGA4(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "GA4" } },
  });
  if (!integration) throw new Error("GA4 not connected");

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID env var not set");

  const client = new BetaAnalyticsDataClient({
    credentials: { client_id: process.env.GA4_CLIENT_ID, client_secret: process.env.GA4_CLIENT_SECRET },
    authClient: { getAccessToken: async () => ({ token: integration.accessToken }) } as never,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "conversions" },
      { name: "bounceRate" },
    ],
  });

  const row = response.rows?.[0]?.metricValues;
  if (!row) return;

  const metrics: Array<[string, number]> = [
    ["sessions", parseFloat(row[0]?.value ?? "0")],
    ["total_users", parseFloat(row[1]?.value ?? "0")],
    ["conversions", parseFloat(row[2]?.value ?? "0")],
    ["bounce_rate", parseFloat(row[3]?.value ?? "0")],
  ];

  for (const [metricKey, value] of metrics) {
    await prisma.metricSnapshot.upsert({
      where: { provider_metricKey_date: { provider: "GA4", metricKey, date: today } } as never,
      update: { value, pulledAt: new Date() },
      create: { provider: "GA4", metricKey, value, date: today },
    });
  }

  // Top channels
  const [channelRes] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "sessionDefaultChannelGrouping" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 5,
  });

  for (const row of channelRes.rows ?? []) {
    const channel = row.dimensionValues?.[0]?.value ?? "unknown";
    const sessions = parseFloat(row.metricValues?.[0]?.value ?? "0");
    await prisma.metricSnapshot.upsert({
      where: { provider_metricKey_date: { provider: "GA4", metricKey: `channel_${channel.toLowerCase().replace(/\s+/g, "_")}`, date: today } } as never,
      update: { value: sessions, pulledAt: new Date() },
      create: { provider: "GA4", metricKey: `channel_${channel.toLowerCase().replace(/\s+/g, "_")}`, value: sessions, date: today },
    });
  }
}
