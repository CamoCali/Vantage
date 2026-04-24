import { prisma } from "@/lib/db/client";

export async function syncGoogleAds(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "GOOGLE_ADS" } },
  });
  if (!integration) throw new Error("Google Ads not connected");

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "");
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!customerId || !developerToken) throw new Error("GOOGLE_ADS_CUSTOMER_ID and GOOGLE_ADS_DEVELOPER_TOKEN required");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");

  const query = `
    SELECT
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions,
      metrics.cost_per_conversion
    FROM customer
    WHERE segments.date BETWEEN '${fmt(thirtyDaysAgo)}' AND '${fmt(today)}'
  `;

  const res = await fetch(
    `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        "developer-token": developerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) throw new Error("Google Ads API error");

  const data = await res.json();
  const rows = data.results ?? [];

  let totalSpend = 0, totalClicks = 0, totalImpressions = 0, totalConversions = 0;
  for (const row of rows) {
    totalSpend += (row.metrics?.costMicros ?? 0) / 1_000_000;
    totalClicks += row.metrics?.clicks ?? 0;
    totalImpressions += row.metrics?.impressions ?? 0;
    totalConversions += row.metrics?.conversions ?? 0;
  }

  const metrics: Array<[string, number]> = [
    ["spend", totalSpend],
    ["clicks", totalClicks],
    ["impressions", totalImpressions],
    ["conversions", totalConversions],
    ["cpc", totalClicks > 0 ? totalSpend / totalClicks : 0],
    ["cpa", totalConversions > 0 ? totalSpend / totalConversions : 0],
  ];

  for (const [metricKey, value] of metrics) {
    await prisma.metricSnapshot.upsert({
      where: { provider_metricKey_date: { provider: "GOOGLE_ADS", metricKey, date: today } } as never,
      update: { value, pulledAt: new Date() },
      create: { provider: "GOOGLE_ADS", metricKey, value, date: today },
    });
  }
}
