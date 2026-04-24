import KPICard from "@/components/dashboard/KPICard";
import MetricChart from "@/components/dashboard/MetricChart";
import { getDashboardData } from "@/lib/dashboard";
import { auth } from "@/lib/auth";
import { Zap, Wifi } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const { isDemo, kpis, charts, adSpend, lastSynced } = await getDashboardData(session?.user?.id ?? "");

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="p-7 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Marketing performance · {monthLabel}</p>
        </div>
        {isDemo ? (
          <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-2 rounded-xl font-medium">
            <Zap className="w-3.5 h-3.5" />
            Demo data —{" "}
            <a href="/settings/integrations" className="underline underline-offset-2 hover:text-amber-900">
              connect integrations
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2 rounded-xl font-medium">
            <Wifi className="w-3.5 h-3.5" />
            Live data
            {lastSynced && (
              <span className="text-emerald-500 font-normal">
                · synced {lastSynced.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            gradient={kpi.gradient}
            live={kpi.live}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <MetricChart
          title="MQLs"
          subtitle="Last 30 days"
          data={charts.mql}
          type="bar"
          lines={[
            { key: "mqls", color: "#6366f1", label: "MQLs" },
            { key: "sqls", color: "#10b981", label: "SQLs" },
          ]}
        />
        <MetricChart
          title="Pipeline Generated"
          subtitle="Last 30 days"
          data={charts.pipeline}
          type="line"
          lines={[
            { key: "pipeline", color: "#6366f1", label: "Pipeline" },
            { key: "closed", color: "#10b981", label: "Closed Won" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart
          title="Organic vs Paid Traffic"
          subtitle="Last 30 days"
          data={charts.traffic}
          type="line"
          lines={[
            { key: "organic", color: "#6366f1", label: "Organic" },
            { key: "paid", color: "#f59e0b", label: "Paid" },
          ]}
        />

        {/* Ad Spend Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
          <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Ad Spend by Channel</h3>
          <p className="text-xs text-gray-400 mb-5">Last 30 days</p>
          <div className="space-y-4">
            {adSpend.map((ch) => {
              const pct = ch.total > 0 ? Math.round((ch.value / ch.total) * 100) : 0;
              return (
                <div key={ch.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium">{ch.name}</span>
                    <span className="text-gray-400 tabular-nums">
                      ${ch.value.toLocaleString()} <span className="text-gray-300">·</span> {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ch.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
