import { Client } from "@hubspot/api-client";
import { prisma } from "@/lib/db/client";

export async function syncHubspot(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "HUBSPOT" } },
  });
  if (!integration) throw new Error("HubSpot not connected");

  const client = new Client({ accessToken: integration.accessToken });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total contacts
  const contactsRes = await client.crm.contacts.basicApi.getPage(1);
  const contactCount = (contactsRes as { total?: number }).total ?? 0;
  await prisma.metricSnapshot.upsert({
    where: { provider_metricKey_date: { provider: "HUBSPOT", metricKey: "total_contacts", date: today } } as never,
    update: { value: contactCount, pulledAt: new Date() },
    create: { provider: "HUBSPOT", metricKey: "total_contacts", value: contactCount, date: today },
  });

  // Deals by stage
  const dealsRes = await client.crm.deals.basicApi.getPage(100, undefined, ["dealstage", "amount", "dealname"]);
  const byStage: Record<string, number> = {};
  let totalPipeline = 0;

  for (const deal of dealsRes.results) {
    const stage = deal.properties.dealstage ?? "unknown";
    const amount = parseFloat(deal.properties.amount ?? "0") || 0;
    byStage[stage] = (byStage[stage] ?? 0) + amount;
    totalPipeline += amount;
  }

  await prisma.metricSnapshot.upsert({
    where: { provider_metricKey_date: { provider: "HUBSPOT", metricKey: "total_pipeline", date: today } } as never,
    update: { value: totalPipeline, pulledAt: new Date() },
    create: { provider: "HUBSPOT", metricKey: "total_pipeline", value: totalPipeline, date: today },
  });

  // MQLs = contacts with lifecyclestage = marketingqualifiedlead
  const mqlRes = await client.crm.contacts.searchApi.doSearch({
    filterGroups: [{ filters: [{ propertyName: "lifecyclestage", operator: "EQ" as never, value: "marketingqualifiedlead" }] }],
    properties: ["lifecyclestage"],
    limit: 1,
    after: "0",
    sorts: [],
  });

  await prisma.metricSnapshot.upsert({
    where: { provider_metricKey_date: { provider: "HUBSPOT", metricKey: "mqls", date: today } } as never,
    update: { value: mqlRes.total ?? 0, pulledAt: new Date() },
    create: { provider: "HUBSPOT", metricKey: "mqls", value: mqlRes.total ?? 0, date: today },
  });
}
