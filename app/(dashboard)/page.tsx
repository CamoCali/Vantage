import KPICard from "@/components/dashboard/KPICard";
import MetricChart from "@/components/dashboard/MetricChart";
import { kpiData, trafficTrend, pipelineTrend, mqlTrend } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Marketing performance overview · July 2026
        </p>
      </div>

      {/* Integration notice */}
      <div className="mb-6 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <span className="text-indigo-600 text-sm">⚡</span>
        <p className="text-sm text-indigo-700">
          <span className="font-semibold">Showing demo data.</span> Connect your integrations in{" "}
          <a href="/settings/integrations" className="underline hover:text-indigo-900">
            Settings → Integrations
          </a>{" "}
          to see live metrics.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={<span>{kpi.icon}</span>}
            accent={kpi.accent}
          />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <MetricChart
          title="MQLs & SQLs — Last 7 Months"
          data={mqlTrend}
          type="bar"
          lines={[
            { key: "mqls", color: "#6366f1", label: "MQLs" },
            { key: "sqls", color: "#10b981", label: "SQLs" },
          ]}
        />
        <MetricChart
          title="Pipeline Generated — Last 7 Months"
          data={pipelineTrend}
          type="line"
          lines={[
            { key: "pipeline", color: "#6366f1", label: "Pipeline" },
            { key: "closed", color: "#10b981", label: "Closed Won" },
          ]}
        />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart
          title="Organic vs Paid Traffic — Last 7 Months"
          data={trafficTrend}
          type="line"
          lines={[
            { key: "organic", color: "#6366f1", label: "Organic" },
            { key: "paid", color: "#f59e0b", label: "Paid" },
          ]}
        />
        {/* Channel spend breakdown */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Ad Spend by Channel
          </h3>
          <div className="space-y-3">
            {[
              { name: "Meta Ads", value: 18200, total: 42600, color: "bg-blue-500" },
              { name: "Google Ads", value: 14800, total: 42600, color: "bg-yellow-500" },
              { name: "LinkedIn Ads", value: 6400, total: 42600, color: "bg-indigo-500" },
              { name: "Other", value: 3200, total: 42600, color: "bg-slate-400" },
            ].map((ch) => (
              <div key={ch.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{ch.name}</span>
                  <span className="text-slate-500">
                    ${ch.value.toLocaleString()} (
                    {((ch.value / ch.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${ch.color}`}
                    style={{ width: `${(ch.value / ch.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
