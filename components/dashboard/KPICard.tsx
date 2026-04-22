import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: string;
}

export default function KPICard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  accent = "bg-indigo-50 text-indigo-600",
}: KPICardProps) {
  const positive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", accent)}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
      <div className="flex items-center gap-1.5">
        {positive ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        )}
        <span
          className={cn(
            "text-xs font-semibold",
            positive ? "text-emerald-600" : "text-red-600"
          )}
        >
          {positive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">{changeLabel}</span>
      </div>
    </div>
  );
}
