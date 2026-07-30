"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SevenDayChartProps = {
  totals: Array<{ label: string; totalOz: number }>;
  goalOz: number;
};

export function SevenDayChart({ totals, goalOz }: SevenDayChartProps) {
  return (
    <div className="rounded-3xl bg-soft-cream/90 p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-moss">Last 7 days</h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={totals} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE3D2" />
            <XAxis dataKey="label" tick={{ fill: "#6B5E52", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6B5E52", fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [`${value} oz`, "Total"]}
              contentStyle={{
                borderRadius: "12px",
                borderColor: "#5B8A72",
              }}
            />
            <Bar dataKey="totalOz" fill="#7EC8E3" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-woodland-muted">Daily goal: {goalOz} oz</p>
    </div>
  );
}
