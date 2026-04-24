import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"].join(" ");

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.GA4_CLIENT_ID!,
    redirect_uri: `${appUrl()}/api/integrations/ga4/callback`,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
