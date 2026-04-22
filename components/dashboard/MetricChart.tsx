"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MetricChartProps {
  title: string;
  data: Record<string, string | number>[];
  type?: "line" | "bar";
  lines?: { key: string; color: string; label?: string }[];
  height?: number;
}

const defaultTooltipStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
};

export default function MetricChart({
  title,
  data,
  type = "line",
  lines = [{ key: "value", color: "#6366f1" }],
  height = 220,
}: MetricChartProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip contentStyle={defaultTooltipStyle} />
            {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={2}
                dot={false}
                name={l.label ?? l.key}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip contentStyle={defaultTooltipStyle} />
            {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {lines.map((l) => (
              <Bar
                key={l.key}
                dataKey={l.key}
                fill={l.color}
                radius={[4, 4, 0, 0]}
                name={l.label ?? l.key}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
