"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Clock, CheckCircle2, Circle, PauseCircle, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import NewCampaignModal from "./NewCampaignModal";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", icon: Circle, color: "text-slate-400 bg-slate-50 border-slate-200" },
  ACTIVE: { label: "Active", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  PAUSED: { label: "Paused", icon: PauseCircle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  owner: string;
  tasks: { total: number; done: number };
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CampaignRow({ campaign: c }: { campaign: Campaign }) {
  const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT;
  const StatusIcon = cfg.icon;
  const progress = c.tasks.total > 0 ? Math.round((c.tasks.done / c.tasks.total) * 100) : 0;

  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 hover:shadow-md hover:border-indigo-100 transition-all group"
    >
      <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0", cfg.color)}>
        <StatusIcon className="w-3 h-3" />
        {cfg.label}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
          {c.name}
        </p>
        {c.description && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{c.description}</p>
        )}
      </div>

      {(c.startDate || c.endDate) && (
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {formatDate(c.startDate)} → {formatDate(c.endDate)}
          </span>
        </div>
      )}

      {c.budget !== null && (
        <div className="hidden md:block text-xs font-medium text-slate-600 shrink-0 w-20 text-right">
          ${(c.budget / 1000).toFixed(0)}k budget
        </div>
      )}

      <div className="shrink-0 w-28">
        {c.tasks.total > 0 ? (
          <>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Tasks</span>
              <span>{c.tasks.done}/{c.tasks.total}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full">
              <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <span className="text-xs text-slate-300">No tasks yet</span>
        )}
      </div>
    </Link>
  );
}

export default function CampaignsClient({ campaigns }: { campaigns: Campaign[] }) {
  const [showModal, setShowModal] = useState(false);

  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const draft = campaigns.filter((c) => c.status === "DRAFT");
  const paused = campaigns.filter((c) => c.status === "PAUSED");
  const completed = campaigns.filter((c) => c.status === "COMPLETED");

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
            <p className="text-sm text-slate-500 mt-1">
              {active.length} active · {draft.length} draft · {completed.length} completed
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">No campaigns yet</h3>
            <p className="text-sm text-slate-400 mb-6">Create your first campaign to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Active</h2>
                <div className="grid grid-cols-1 gap-3">
                  {active.map((c) => <CampaignRow key={c.id} campaign={c} />)}
                </div>
              </section>
            )}
            {draft.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Draft</h2>
                <div className="grid grid-cols-1 gap-3">
                  {draft.map((c) => <CampaignRow key={c.id} campaign={c} />)}
                </div>
              </section>
            )}
            {paused.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Paused</h2>
                <div className="grid grid-cols-1 gap-3">
                  {paused.map((c) => <CampaignRow key={c.id} campaign={c} />)}
                </div>
              </section>
            )}
            {completed.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Completed</h2>
                <div className="grid grid-cols-1 gap-3">
                  {completed.map((c) => <CampaignRow key={c.id} campaign={c} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} />}
    </>
  );
}
