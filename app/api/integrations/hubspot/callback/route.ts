import { auth } from "@/lib/auth";
import { saveTokens, appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) redirect("/settings/integrations?error=no_code");

  const res = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: `${appUrl()}/api/integrations/hubspot/callback`,
      code: code!,
    }),
  });

  if (!res.ok) redirect("/settings/integrations?error=token_exchange");

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await saveTokens(session.user.id, "HUBSPOT", data.access_token, data.refresh_token, expiresAt);

  redirect("/settings/integrations?connected=hubspot");
}
