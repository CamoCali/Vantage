import { Plus, Shield, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", color: "bg-indigo-50 text-indigo-700 border-indigo-200", desc: "Full access — manage users, integrations, and all data" },
  EDITOR: { label: "Editor", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Create and edit campaigns, view all data" },
  VIEWER: { label: "Viewer", color: "bg-slate-50 text-slate-600 border-slate-200", desc: "View-only access to dashboards and campaigns" },
};

const mockUsers = [
  { id: "1", name: "Derek Feniger", email: "derek@fendigital.com", role: "ADMIN", joined: "Jan 2026" },
];

export default function UsersPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage who has access to Vantage
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Role reference */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", cfg.color)}>
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{cfg.desc}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-700">
            Team Members ({mockUsers.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-50">
          {mockUsers.map((user) => {
            const cfg = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG];
            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", cfg.color)}>
                  {cfg.label}
                </span>
                <span className="text-xs text-slate-400 hidden md:block w-20 text-right">
                  {user.joined}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Invited users will receive an email with a link to set their password.
      </p>
    </div>
  );
}
