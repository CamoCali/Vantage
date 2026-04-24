import { auth } from "@/lib/auth";
import { saveTokens, appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) redirect("/settings/integrations?error=no_code");

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: `${appUrl()}/api/integrations/meta/callback`,
    code: code!,
  });

  const res = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params}`);
  if (!res.ok) redirect("/settings/integrations?error=token_exchange");

  const data = await res.json();
  // Exchange short-lived for long-lived token
  const llParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: data.access_token,
  });
  const llRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${llParams}`);
  const llData = llRes.ok ? await llRes.json() : data;

  const expiresAt = llData.expires_in ? new Date(Date.now() + llData.expires_in * 1000) : null;
  await saveTokens(session.user.id, "META", llData.access_token ?? data.access_token, null, expiresAt);

  redirect("/settings/integrations?connected=meta");
}
