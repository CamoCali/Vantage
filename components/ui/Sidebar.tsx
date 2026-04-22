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
  LogOut,
  ChevronDown,
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
  { label: "Integrations", href: "/settings/integrations", icon: Plug },
  { label: "Users", href: "/settings/users", icon: Users },
];

export default function Sidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings")
  );

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">
          Vantage
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Settings section */}
        <div className="pt-4">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 ml-auto transition-transform",
                settingsOpen && "rotate-180"
              )}
            />
          </button>
          {settingsOpen &&
            settingsNav.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "text-white bg-slate-800"
                      : "text-slate-500 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </Link>
              );
            })}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-sm text-slate-300 truncate flex-1">
            {userName ?? "User"}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
