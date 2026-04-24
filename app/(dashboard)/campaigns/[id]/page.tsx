import Link from "next/link";
import { ArrowLeft, Clock, Plus, User } from "lucide-react";
import KanbanBoard from "@/components/campaigns/KanbanBoard";
import CampaignSidePanel from "@/components/campaigns/CampaignSidePanel";
import { auth } from "@/lib/auth";

const mockCampaign = {
  id: "1",
  name: "Q3 Product Launch",
  status: "ACTIVE",
  startDate: "July 1, 2026",
  endDate: "September 30, 2026",
  budget: 85000,
  owner: "Derek F.",
  description:
    "Full-funnel launch campaign for the new product line across paid, organic, and email channels. Goal is 300 MQLs and $500k pipeline by end of Q3.",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const c = mockCampaign;

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
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight mb-1.5">
              {c.name}
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              {c.description}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shrink-0 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-5 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {c.startDate} → {c.endDate}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User className="w-3.5 h-3.5" />
            {c.owner}
          </div>
          <div className="text-xs text-gray-400">
            Budget:{" "}
            <span className="font-semibold text-gray-600">
              ${c.budget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Split view: Kanban + Side panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Kanban — takes most of the space */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <KanbanBoard />
        </div>

        {/* Tabbed side panel: Discussion + Assets */}
        <div className="w-72 shrink-0 border-l border-gray-200/60 bg-white flex flex-col overflow-hidden">
          <CampaignSidePanel
            campaignId={id}
            currentUserId={session?.user?.id}
          />
        </div>
      </div>
    </div>
  );
}
