import Link from "next/link";
import { ArrowLeft, Clock, Plus, User } from "lucide-react";
import KanbanBoard from "@/components/campaigns/KanbanBoard";

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

export default function CampaignDetailPage() {
  const c = mockCampaign;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Campaigns
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-emerald-600 bg-emerald-50 border-emerald-200">
                Active
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{c.name}</h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              {c.description}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-5 mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            {c.startDate} → {c.endDate}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <User className="w-4 h-4" />
            {c.owner}
          </div>
          <div className="text-sm text-slate-500">
            Budget:{" "}
            <span className="font-medium text-slate-900">
              ${c.budget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
