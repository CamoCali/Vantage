import KPICard from "@/components/dashboard/KPICard";
import MetricChart from "@/components/dashboard/MetricChart";
import { kpiData, trafficTrend, pipelineTrend, mqlTrend } from "@/lib/mock-data";
import { Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-7 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Marketing performance · July 2026</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-2 rounded-xl font-medium">
          <Zap className="w-3.5 h-3.5" />
          Demo data —{" "}
          <a href="/settings/integrations" className="underline underline-offset-2 hover:text-amber-900">
            connect integrations
          </a>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { ...kpiData[0], gradient: "from-indigo-500 to-violet-500" },
          { ...kpiData[1], gradient: "from-violet-500 to-purple-600" },
          { ...kpiData[2], gradient: "from-emerald-400 to-teal-500" },
          { ...kpiData[3], gradient: "from-orange-400 to-rose-500" },
          { ...kpiData[4], gradient: "from-blue-400 to-indigo-500" },
          { ...kpiData[5], gradient: "from-teal-400 to-cyan-500" },
        ].map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={<span>{kpi.icon}</span>}
            gradient={kpi.gradient}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <MetricChart
          title="MQLs & SQLs"
          subtitle="Last 7 months"
          data={mqlTrend}
          type="bar"
          lines={[
            { key: "mqls", color: "#6366f1", label: "MQLs" },
            { key: "sqls", color: "#10b981", label: "SQLs" },
          ]}
        />
        <MetricChart
          title="Pipeline Generated"
          subtitle="Last 7 months"
          data={pipelineTrend}
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
          subtitle="Last 7 months"
          data={trafficTrend}
          type="line"
          lines={[
            { key: "organic", color: "#6366f1", label: "Organic" },
            { key: "paid", color: "#f59e0b", label: "Paid" },
          ]}
        />

        {/* Ad spend breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
          <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Ad Spend by Channel</h3>
          <p className="text-xs text-gray-400 mb-5">Current month</p>
          <div className="space-y-4">
            {[
              { name: "Meta Ads", value: 18200, total: 42600, color: "bg-indigo-500" },
              { name: "Google Ads", value: 14800, total: 42600, color: "bg-violet-500" },
              { name: "LinkedIn Ads", value: 6400, total: 42600, color: "bg-blue-400" },
              { name: "Other", value: 3200, total: 42600, color: "bg-gray-300" },
            ].map((ch) => {
              const pct = Math.round((ch.value / ch.total) * 100);
              return (
                <div key={ch.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium">{ch.name}</span>
                    <span className="text-gray-400 tabular-nums">
                      ${ch.value.toLocaleString()} <span className="text-gray-300">·</span> {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ch.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
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
