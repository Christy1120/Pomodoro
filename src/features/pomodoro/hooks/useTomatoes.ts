// src/features/pomodoro/hooks/useTomatoes.ts
import { useEffect, useMemo, useState } from "react";

type TomatoStore = { byDate: Record<string, number>; total: number };

const LS_KEY = "pomodoro_sloth_tomatoes";

export function useTomatoes() {
  const todayKey = useMemo(
    () => new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    []
  );

  const [byDate, setByDate] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const today = byDate[todayKey] ?? 0;

  // 讀取
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as TomatoStore;
      setByDate(parsed.byDate ?? {});
      setTotal(parsed.total ?? 0);
    } catch {}
  }, []);

  // 寫入
  useEffect(() => {
    try {
      const payload: TomatoStore = { byDate, total };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {}
  }, [byDate, total]);

  const bump = () => {
    setByDate((m) => ({ ...m, [todayKey]: (m[todayKey] ?? 0) + 1 }));
    setTotal((n) => n + 1);
  };

  const resetToday = () => {
    setByDate((m) => {
      if (!m[todayKey]) return m;
      const { [todayKey]: _, ...rest } = m;
      return { ...rest, [todayKey]: 0 };
    });
  };

  return { today, total, byDate, bump, resetToday };
}
