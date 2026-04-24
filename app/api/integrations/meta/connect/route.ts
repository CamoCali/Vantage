import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/integrations/oauth";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: `${appUrl()}/api/integrations/meta/callback`,
    scope: "ads_read,ads_management",
    response_type: "code",
  });

  redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
}
