"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shield, Trash2, Copy, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_CONFIG = {
  ADMIN:  { label: "Admin",  color: "bg-indigo-50 text-indigo-700 border-indigo-200",  desc: "Full access — manage users, integrations, and all data" },
  EDITOR: { label: "Editor", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Create and edit campaigns, view all data" },
  VIEWER: { label: "Viewer", color: "bg-slate-50 text-slate-600 border-slate-200",     desc: "View-only access to dashboards and campaigns" },
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface Credentials { email: string; password: string; name: string }

function generatePassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function InviteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (creds: Credentials) => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: "EDITOR" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.trim() || saving) return;
    setSaving(true);
    setError("");
    const password = generatePassword();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setSaving(false); return; }
      onCreated({ email: form.email.trim().toLowerCase(), password, name: form.name.trim() || form.email });
    } catch { setError("Something went wrong"); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Invite team member</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Smith"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email <span className="text-red-400">*</span></label>
            <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@company.com"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700">
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={!form.email.trim() || saving}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CredentialsModal({ creds, onClose }: { creds: Credentials; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyAll() {
    navigator.clipboard.writeText(`FlowDash login\nURL: ${window.location.origin}\nEmail: ${creds.email}\nPassword: ${creds.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Account created</h2>
          <p className="text-sm text-gray-400 mt-1">Share these credentials with {creds.name}.</p>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2.5 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans text-xs font-semibold">Email</span>
              <span className="text-gray-700">{creds.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans text-xs font-semibold">Password</span>
              <span className="text-gray-700 font-bold">{creds.password}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">They can change their password in Settings → Profile after logging in.</p>
          <div className="flex gap-3 pt-1">
            <button onClick={copyAll}
              className="flex-1 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-2">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy credentials"}
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersClient({ initialUsers, currentUserId, isAdmin }: {
  initialUsers: User[];
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRoleChange(id: string, role: string) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this user? They will lose access immediately.")) return;
    setRemoving(id);
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setRemoving(null);
  }

  function handleCreated(creds: Credentials) {
    setShowInvite(false);
    setCredentials(creds);
    router.refresh();
  }

  return (
    <>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-500 mt-1">Manage who has access to FlowDash</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Invite User
            </button>
          )}
        </div>

        {/* Role reference */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <div key={role} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", cfg.color)}>{cfg.label}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{cfg.desc}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">Team Members ({users.length})</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {users.map((user) => {
              const cfg = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.EDITOR;
              const isCurrentUser = user.id === currentUserId;
              return (
                <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {(user.name ?? user.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {user.name ?? user.email}
                      {isCurrentUser && <span className="text-xs text-slate-400 ml-2">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  {isAdmin && !isCurrentUser ? (
                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                      <option value="ADMIN">Admin</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", cfg.color)}>{cfg.label}</span>
                  )}
                  <span className="text-xs text-slate-400 hidden md:block w-24 text-right">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  {isAdmin && !isCurrentUser && (
                    <button onClick={() => handleRemove(user.id)} disabled={removing === user.id}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
                      {removing === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onCreated={handleCreated} />}
      {credentials && <CredentialsModal creds={credentials} onClose={() => { setCredentials(null); router.refresh(); }} />}
    </>
  );
}
