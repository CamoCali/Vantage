import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import CampaignsClient from "@/components/campaigns/CampaignsClient";

export default async function CampaignsPage() {
  const session = await auth();

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { select: { status: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  const data = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    startDate: c.startDate?.toISOString().split("T")[0] ?? null,
    endDate: c.endDate?.toISOString().split("T")[0] ?? null,
    budget: c.budget,
    owner: c.owner.name ?? c.owner.email,
    tasks: {
      total: c.tasks.length,
      done: c.tasks.filter((t) => t.status === "DONE").length,
    },
  }));

  return <CampaignsClient campaigns={data} />;
}
