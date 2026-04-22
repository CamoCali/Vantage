import Link from "next/link";
import { Plus, Clock, CheckCircle2, Circle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", icon: Circle, color: "text-slate-400 bg-slate-50 border-slate-200" },
  ACTIVE: { label: "Active", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  PAUSED: { label: "Paused", icon: PauseCircle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

const mockCampaigns = [
  {
    id: "1",
    name: "Q3 Product Launch",
    status: "ACTIVE",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    budget: 85000,
    owner: "Derek F.",
    tasks: { total: 12, done: 7 },
    description: "Full-funnel launch campaign for the new product line across paid, organic, and email.",
  },
  {
    id: "2",
    name: "Summer Retargeting Push",
    status: "ACTIVE",
    startDate: "2026-07-15",
    endDate: "2026-08-31",
    budget: 24000,
    owner: "Derek F.",
    tasks: { total: 6, done: 4 },
    description: "Meta + Google retargeting for warm audiences from Q2 campaigns.",
  },
  {
    id: "3",
    name: "SEO Content Sprint",
    status: "ACTIVE",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    budget: 12000,
    owner: "Derek F.",
    tasks: { total: 20, done: 14 },
    description: "20 high-intent blog posts targeting mid-funnel keywords.",
  },
  {
    id: "4",
    name: "Partner Webinar Series",
    status: "DRAFT",
    startDate: "2026-08-01",
    endDate: "2026-10-31",
    budget: 8000,
    owner: "Derek F.",
    tasks: { total: 8, done: 0 },
    description: "Co-marketing webinars with 3 strategic partners.",
  },
  {
    id: "5",
    name: "Q2 Demand Gen",
    status: "COMPLETED",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    budget: 60000,
    owner: "Derek F.",
    tasks: { total: 15, done: 15 },
    description: "Multi-channel demand gen across paid social, SEM, and email nurture.",
  },
];

export default function CampaignsPage() {
  const active = mockCampaigns.filter((c) => c.status === "ACTIVE");
  const draft = mockCampaigns.filter((c) => c.status === "DRAFT");
  const completed = mockCampaigns.filter((c) => c.status === "COMPLETED");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">
            {active.length} active · {draft.length} draft · {completed.length} completed
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Active
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {active.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {/* Draft */}
      {draft.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Draft
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {draft.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Completed
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {completed.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CampaignRow({ campaign: c }: { campaign: (typeof mockCampaigns)[0] }) {
  const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg.icon;
  const progress = Math.round((c.tasks.done / c.tasks.total) * 100);

  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 hover:shadow-md hover:border-indigo-100 transition-all group"
    >
      {/* Status badge */}
      <span
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0",
          cfg.color
        )}
      >
        <StatusIcon className="w-3 h-3" />
        {cfg.label}
      </span>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
          {c.name}
        </p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{c.description}</p>
      </div>

      {/* Dates */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span>
          {c.startDate} → {c.endDate}
        </span>
      </div>

      {/* Budget */}
      <div className="hidden md:block text-xs font-medium text-slate-600 shrink-0 w-20 text-right">
        ${(c.budget / 1000).toFixed(0)}k budget
      </div>

      {/* Task progress */}
      <div className="shrink-0 w-28">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Tasks</span>
          <span>
            {c.tasks.done}/{c.tasks.total}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-1.5 rounded-full bg-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
