import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, DollarSign } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import KanbanBoard from "@/components/campaigns/KanbanBoard";
import CampaignSidePanel from "@/components/campaigns/CampaignSidePanel";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-600 border-slate-200" },
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  PAUSED: { label: "Paused", color: "bg-amber-100 text-amber-700 border-amber-200" },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { owner: { select: { name: true, email: true } } },
  });

  if (!campaign) notFound();

  const cfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.DRAFT;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b border-gray-200/60 bg-[#f4f5f7]">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          All Campaigns
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight mb-1.5">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 mt-4">
          {(campaign.startDate || campaign.endDate) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User className="w-3.5 h-3.5" />
            {campaign.owner.name ?? campaign.owner.email}
          </div>
          {campaign.budget !== null && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="font-semibold text-gray-600">
                ${campaign.budget.toLocaleString()} budget
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Split view: Kanban + Side panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <KanbanBoard campaignId={id} />
        </div>
        <div className="w-72 shrink-0 border-l border-gray-200/60 bg-white flex flex-col overflow-hidden">
          <CampaignSidePanel campaignId={id} currentUserId={session?.user?.id} />
        </div>
      </div>
    </div>
  );
}
