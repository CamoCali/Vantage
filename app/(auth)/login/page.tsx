"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[380px] relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">FlowDash</span>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8">
          <h1 className="text-[18px] font-semibold text-white mb-1">Sign in</h1>
          <p className="text-sm text-white/40 mb-7">Access your marketing workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          FlowDash · Marketing Execution Platform
        </p>
      </div>
    </div>
  );
}
