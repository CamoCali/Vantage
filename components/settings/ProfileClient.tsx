"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface User { id: string; name: string | null; email: string; role: string }

export default function ProfileClient({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || savingName) return;
    setSavingName(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setSavingPw(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json();
    setSavingPw(false);
    if (!res.ok) { setPwError(data.error ?? "Something went wrong"); return; }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Update your name and password</p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Account info</h2>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
          <p className="px-3 py-2.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">{user.email}</p>
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
        </div>
        <form onSubmit={saveName}>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Display name</label>
          <div className="flex gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700 placeholder-gray-400" />
            <button type="submit" disabled={!name.trim() || savingName}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-2 shrink-0">
              {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : nameSaved ? <Check className="w-3.5 h-3.5" /> : null}
              {nameSaved ? "Saved" : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Change password</h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current password</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">New password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm new password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700" />
          </div>
          {pwError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
          <button type="submit" disabled={!currentPw || !newPw || !confirmPw || savingPw}
            className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2">
            {savingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pwSaved ? <Check className="w-3.5 h-3.5" /> : null}
            {pwSaved ? "Password updated" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
