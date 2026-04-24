import { prisma } from "@/lib/db/client";

export async function syncSalesforce(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "SALESFORCE" } },
  });
  if (!integration) throw new Error("Salesforce not connected");

  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL ?? "https://login.salesforce.com";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  async function query(soql: string) {
    const res = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`,
      { headers: { Authorization: `Bearer ${integration!.accessToken}`, "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error("Salesforce API error");
    return res.json();
  }

  // Total pipeline value
  const pipelineRes = await query(
    "SELECT SUM(Amount) total FROM Opportunity WHERE IsClosed = false"
  );
  const totalPipeline = pipelineRes.records?.[0]?.total ?? 0;

  // Won deals (last 30 days)
  const wonRes = await query(
    "SELECT SUM(Amount) total, COUNT(Id) cnt FROM Opportunity WHERE IsWon = true AND CloseDate = LAST_N_DAYS:30"
  );
  const wonRevenue = wonRes.records?.[0]?.total ?? 0;
  const wonCount = wonRes.records?.[0]?.cnt ?? 0;

  // Open opportunities count
  const openRes = await query(
    "SELECT COUNT(Id) cnt FROM Opportunity WHERE IsClosed = false"
  );
  const openCount = openRes.records?.[0]?.cnt ?? 0;

  const metrics: Array<[string, number]> = [
    ["total_pipeline", totalPipeline],
    ["won_revenue_30d", wonRevenue],
    ["won_deals_30d", wonCount],
    ["open_opportunities", openCount],
  ];

  for (const [metricKey, value] of metrics) {
    await prisma.metricSnapshot.upsert({
      where: { provider_metricKey_date: { provider: "SALESFORCE", metricKey, date: today } } as never,
      update: { value, pulledAt: new Date() },
      create: { provider: "SALESFORCE", metricKey, value, date: today },
    });
  }
}
