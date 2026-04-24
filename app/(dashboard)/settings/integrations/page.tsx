import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import IntegrationsClient from "@/components/settings/IntegrationsClient";

export default async function IntegrationsPage() {
  const session = await auth();

  const connected = await prisma.integration.findMany({
    where: { userId: session?.user?.id ?? "" },
    select: { provider: true, connectedAt: true, updatedAt: true },
  });

  const connectedMap = Object.fromEntries(
    connected.map((i) => [i.provider, { ...i, connectedAt: i.connectedAt.toISOString(), updatedAt: i.updatedAt.toISOString() }])
  );

  return <IntegrationsClient connectedMap={connectedMap} />;
}
