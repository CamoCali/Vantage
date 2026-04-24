import { auth } from "@/lib/auth";
import { saveTokens, appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) redirect("/settings/integrations?error=no_code");

  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL ?? "https://login.salesforce.com";

  const res = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
      redirect_uri: `${appUrl()}/api/integrations/salesforce/callback`,
      code: code!,
    }),
  });

  if (!res.ok) redirect("/settings/integrations?error=token_exchange");

  const data = await res.json();
  await saveTokens(session.user.id, "SALESFORCE", data.access_token, data.refresh_token, null);

  redirect("/settings/integrations?connected=salesforce");
}
