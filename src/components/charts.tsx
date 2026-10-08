"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Charts({
  kind,
  points,
  minutes,
}: {
  kind: "estimate" | "minutes";
  points: { label: string; estimate: number }[];
  minutes: { label: string; minutes: number }[];
}) {
  if (kind === "estimate") return <EstimateChart data={points} />;
  return <MinutesChart data={minutes} />;
}

function EstimateChart({ data }: { data: { label: string; estimate: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm leading-6 text-muted">还没有可以连成线的练习估算。保存基线，或做完一套阅读并记下正确数之后，这里会出现。</p>;
  }
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e3ddd2" vertical={false} />
          <XAxis dataKey="label" stroke="#6e685f" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 495]} stroke="#6e685f" fontSize={12} tickLine={false} axisLine={false} width={36} />
          <Tooltip contentStyle={{ background: "#fffdf8", border: "1px solid #e3ddd2", borderRadius: 12 }} />
          <ReferenceLine y={300} stroke="#8d5b2a" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="estimate" name="练习估算" stroke="#1e6b45" strokeWidth={2} dot={{ r: 3, fill: "#1e6b45" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MinutesChart({ data }: { data: { label: string; minutes: number }[] }) {
  if (data.length === 0 || data.every((item) => item.minutes === 0)) {
    return <p className="text-sm text-muted">还没有学习分钟数。</p>;
  }
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e3ddd2" vertical={false} />
          <XAxis dataKey="label" stroke="#6e685f" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6e685f" fontSize={12} tickLine={false} axisLine={false} width={36} />
          <Tooltip contentStyle={{ background: "#fffdf8", border: "1px solid #e3ddd2", borderRadius: 12 }} />
          <Bar dataKey="minutes" name="分钟" fill="#1e6b45" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
