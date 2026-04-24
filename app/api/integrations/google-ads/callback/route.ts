import { auth } from "@/lib/auth";
import { saveTokens, appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) redirect("/settings/integrations?error=no_code");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      redirect_uri: `${appUrl()}/api/integrations/google-ads/callback`,
      code: code!,
    }),
  });

  if (!res.ok) redirect("/settings/integrations?error=token_exchange");

  const data = await res.json();
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000);

  await saveTokens(session.user.id, "GOOGLE_ADS", data.access_token, data.refresh_token, expiresAt);

  redirect("/settings/integrations?connected=google_ads");
}
