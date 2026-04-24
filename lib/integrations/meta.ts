import { prisma } from "@/lib/db/client";

export async function syncMeta(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "META" } },
  });
  if (!integration) throw new Error("Meta not connected");

  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  if (!adAccountId) throw new Error("META_AD_ACCOUNT_ID env var not set");

  const token = integration.accessToken;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fields = "spend,impressions,clicks,actions,action_values,cpc,cpm,reach";
  const res = await fetch(
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=${fields}&date_preset=last_30d&access_token=${token}`
  );
  if (!res.ok) throw new Error("Meta API error");

  const data = await res.json();
  const row = data.data?.[0];
  if (!row) return;

  const conversions = (row.actions ?? []).find((a: { action_type: string }) => a.action_type === "lead")?.value ?? 0;
  const revenue = (row.action_values ?? []).find((a: { action_type: string }) => a.action_type === "offsite_conversion.fb_pixel_purchase")?.value ?? 0;
  const roas = parseFloat(row.spend) > 0 ? parseFloat(revenue) / parseFloat(row.spend) : 0;

  const metrics: Array<[string, number]> = [
    ["spend", parseFloat(row.spend ?? "0")],
    ["impressions", parseFloat(row.impressions ?? "0")],
    ["clicks", parseFloat(row.clicks ?? "0")],
    ["cpc", parseFloat(row.cpc ?? "0")],
    ["cpm", parseFloat(row.cpm ?? "0")],
    ["reach", parseFloat(row.reach ?? "0")],
    ["conversions", parseFloat(conversions)],
    ["roas", roas],
  ];

  for (const [metricKey, value] of metrics) {
    await prisma.metricSnapshot.upsert({
      where: { provider_metricKey_date: { provider: "META", metricKey, date: today } } as never,
      update: { value, pulledAt: new Date() },
      create: { provider: "META", metricKey, value, date: today },
    });
  }
}
