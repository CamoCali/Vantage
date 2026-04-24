import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: string;
  gradient?: string;
}

export default function KPICard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  gradient = "from-indigo-500 to-violet-500",
}: KPICardProps) {
  const positive = change >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100/80 group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[13px] font-medium text-gray-500">{title}</p>
        {icon && (
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-gradient-to-br text-white shadow-sm",
            gradient
          )}>
            {icon}
          </div>
        )}
      </div>

      <p className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mb-3">
        {value}
      </p>

      <div className="flex items-center gap-1.5">
        <div className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold",
          positive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        )}>
          {positive
            ? <TrendingUp className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />
          }
          {positive ? "+" : ""}{change.toFixed(1)}%
        </div>
        <span className="text-xs text-gray-400">{changeLabel}</span>
      </div>
    </div>
  );
}
