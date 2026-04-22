import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TASK_STATUS = {
  TODO: { label: "To Do", color: "text-slate-500 bg-slate-50 border-slate-200" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
  REVIEW: { label: "In Review", color: "text-amber-600 bg-amber-50 border-amber-200" },
  DONE: { label: "Done", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

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
  tasks: [
    { id: "t1", title: "Finalize messaging framework", status: "DONE", assignee: "Derek F.", dueDate: "Jul 5", description: "" },
    { id: "t2", title: "Create paid social ad creative (10 variants)", status: "DONE", assignee: "Derek F.", dueDate: "Jul 10", description: "" },
    { id: "t3", title: "Write and schedule launch email sequence", status: "DONE", assignee: "Derek F.", dueDate: "Jul 12", description: "" },
    { id: "t4", title: "Set up Google Ads campaigns", status: "DONE", assignee: "Derek F.", dueDate: "Jul 14", description: "" },
    { id: "t5", title: "Launch Meta campaigns", status: "DONE", assignee: "Derek F.", dueDate: "Jul 15", description: "" },
    { id: "t6", title: "Publish launch blog post + PR", status: "DONE", assignee: "Derek F.", dueDate: "Jul 15", description: "" },
    { id: "t7", title: "Publish launch blog post + PR", status: "DONE", assignee: "Derek F.", dueDate: "Jul 15", description: "" },
    { id: "t8", title: "Week 2 performance review", status: "IN_PROGRESS", assignee: "Derek F.", dueDate: "Jul 22", description: "" },
    { id: "t9", title: "A/B test ad copy iteration #1", status: "IN_PROGRESS", assignee: "Derek F.", dueDate: "Jul 28", description: "" },
    { id: "t10", title: "Mid-campaign landing page optimization", status: "TODO", assignee: "Derek F.", dueDate: "Aug 5", description: "" },
    { id: "t11", title: "August nurture email sequence", status: "TODO", assignee: "Derek F.", dueDate: "Aug 1", description: "" },
    { id: "t12", title: "End-of-quarter campaign retrospective", status: "TODO", assignee: "Derek F.", dueDate: "Sep 30", description: "" },
  ],
};

export default function CampaignDetailPage() {
  const c = mockCampaign;
  const done = c.tasks.filter((t) => t.status === "DONE").length;
  const progress = Math.round((done / c.tasks.length) * 100);

  const grouped = {
    IN_PROGRESS: c.tasks.filter((t) => t.status === "IN_PROGRESS"),
    TODO: c.tasks.filter((t) => t.status === "TODO"),
    REVIEW: c.tasks.filter((t) => t.status === "REVIEW"),
    DONE: c.tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
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

        {/* Meta row */}
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

          {/* Progress */}
          <div className="flex-1 min-w-40">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>
                {done}/{c.tasks.length} tasks complete
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-6">
        {(["IN_PROGRESS", "TODO", "REVIEW", "DONE"] as const).map((status) => {
          const tasks = grouped[status];
          if (tasks.length === 0) return null;
          const cfg = TASK_STATUS[status];
          return (
            <div key={status}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {cfg.label} ({tasks.length})
              </h2>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-white rounded-lg border border-slate-100 px-4 py-3 hover:border-slate-200 transition-colors"
                  >
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        task.status === "DONE"
                          ? "line-through text-slate-400"
                          : "text-slate-700"
                      )}
                    >
                      {task.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium shrink-0",
                        cfg.color
                      )}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0 w-16 text-right">
                      {task.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
