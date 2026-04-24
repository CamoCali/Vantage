import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SALESFORCE_CLIENT_ID!,
    redirect_uri: `${appUrl()}/api/integrations/salesforce/callback`,
    scope: "api refresh_token",
  });

  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL ?? "https://login.salesforce.com";
  redirect(`${instanceUrl}/services/oauth2/authorize?${params}`);
}
