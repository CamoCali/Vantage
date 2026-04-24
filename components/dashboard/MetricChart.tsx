"use client";

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface MetricChartProps {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  type?: "line" | "bar";
  lines?: { key: string; color: string; label?: string }[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function MetricChart({
  title,
  subtitle,
  data,
  type = "line",
  lines = [{ key: "value", color: "#6366f1" }],
  height = 220,
}: MetricChartProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
            <Tooltip content={<CustomTooltip />} />
            {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />}
            {lines.map((l) => (
              <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color}
                strokeWidth={2.5} dot={false} name={l.label ?? l.key} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
            <Tooltip content={<CustomTooltip />} />
            {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />}
            {lines.map((l) => (
              <Bar key={l.key} dataKey={l.key} fill={l.color}
                radius={[4, 4, 0, 0]} name={l.label ?? l.key} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
