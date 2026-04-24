import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

const SCOPES = ["crm.objects.contacts.read", "crm.objects.deals.read", "crm.schemas.deals.read"].join(" ");

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    redirect_uri: `${appUrl()}/api/integrations/hubspot/callback`,
    scope: SCOPES,
  });

  redirect(`https://app.hubspot.com/oauth/authorize?${params}`);
}
