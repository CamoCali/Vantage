"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  Sparkles,
  Settings,
  Plug,
  Users,
  UserCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "AI Agent", href: "/ai", icon: Sparkles },
];

const settingsNav = [
  { label: "Profile", href: "/settings/profile", icon: UserCircle },
  { label: "Integrations", href: "/settings/integrations", icon: Plug },
  { label: "Users", href: "/settings/users", icon: Users },
];

export default function Sidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"));

  return (
    <aside
      style={{ width: 224, minWidth: 224 }}
      className="flex flex-col h-screen bg-[#111827] text-white select-none"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-white font-semibold text-[15px] tracking-tight">Vantage</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {/* Section label */}
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pb-1.5 pt-1">
          Main
        </p>

        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150",
                active
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/50"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/90"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-white/40")} />
              {label}
            </Link>
          );
        })}

        {/* Settings */}
        <div className="pt-3">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pb-1.5">
            Settings
          </p>
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150",
              pathname.startsWith("/settings")
                ? "text-white/90"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/90"
            )}
          >
            <Settings className="w-4 h-4 shrink-0 text-white/40" />
            Settings
            <ChevronRight
              className={cn(
                "w-3 h-3 ml-auto text-white/30 transition-transform duration-200",
                settingsOpen && "rotate-90"
              )}
            />
          </button>

          {settingsOpen && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/[0.08] pl-3">
              {settingsNav.map(({ label, href, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150",
                      active
                        ? "text-white bg-white/[0.08]"
                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User */}
      <div className="px-2.5 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white/80 truncate leading-none mb-0.5">
              {userName ?? "User"}
            </p>
            <p className="text-[11px] text-white/30 leading-none">Admin</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
