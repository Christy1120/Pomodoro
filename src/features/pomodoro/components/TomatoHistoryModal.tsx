// src/features/pomodoro/components/TomatoHistoryModal.tsx
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

type Props = {
  open: boolean;
  onClose: () => void;
  byDate: Record<string, number>; // YYYY-MM-DD -> count
};

function buildDailySeries(byDate: Record<string, number>, days = 30) {
  const out: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key.slice(5), count: byDate[key] ?? 0 }); // MM-DD
  }
  return out;
}

function buildMonthlySeries(byDate: Record<string, number>, months = 12) {
  const bucket: Record<string, number> = {}; // YYYY-MM -> sum
  Object.entries(byDate).forEach(([k, v]) => {
    const ym = k.slice(0, 7);
    bucket[ym] = (bucket[ym] ?? 0) + v;
  });

  const out: { month: string; count: number }[] = [];
  const now = new Date();
  const curYm = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = curYm(d);
    out.push({ month: ym, count: bucket[ym] ?? 0 });
  }
  return out;
}

export default function TomatoHistoryModal({ open, onClose, byDate }: Props) {
  const [tab, setTab] = useState<"day" | "month">("day");

  const daily = useMemo(() => buildDailySeries(byDate, 30), [byDate]);
  const monthly = useMemo(() => buildMonthlySeries(byDate, 12), [byDate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 面板 */}
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="font-semibold">番茄歷史紀錄</div>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setTab("day")}
                className={`px-4 py-1.5 rounded-lg text-sm ${
                  tab === "day" ? "bg-white shadow" : "text-slate-600"
                }`}
              >
                日(近30天)
              </button>
              <button
                onClick={() => setTab("month")}
                className={`px-4 py-1.5 rounded-lg text-sm ${
                  tab === "month" ? "bg-white shadow" : "text-slate-600"
                }`}
              >
                月(近12個月)
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="p-5">
            <div className="h-[300px] w-full">
              {tab === "day" ? (
                <ResponsiveContainer>
                  <AreaChart data={daily} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={monthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 text-xs text-slate-500">
            資料來源：本機儲存（localStorage），切到「休息」即記一顆番茄。
          </div>
        </div>
      </div>
    </div>
  );
}
