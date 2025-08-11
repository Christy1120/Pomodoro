// src/features/pomodoro/hooks/usePomodoro.ts
import { useEffect, useRef, useState } from "react";

export interface UsePomodoroOptions {
  initialWork?: number;   // 分鐘
  initialBreak?: number;  // 分鐘
  onPhaseSwitch?: (nextIsWork: boolean) => void; // 切換時回呼
}

export function usePomodoro(options?: UsePomodoroOptions) {
  const work0 = options?.initialWork ?? 25;
  const break0 = options?.initialBreak ?? 5;

  const [workMin, setWorkMin] = useState<number>(work0);
  const [breakMin, setBreakMin] = useState<number>(break0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isWork, setIsWork] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(work0 * 60);

  // 這兩個 ref 是關鍵：處理「暫停/繼續」不丟秒數
  const startedAtMs = useRef<number | null>(null);   // 這一輪開始的時間戳
  const baseLeftRef = useRef<number>(secondsLeft);   // 這一輪開始時的剩餘秒數

  // 只有在「切換模式」或「非運行時調整分鐘數」才初始化當前階段
  useEffect(() => {
    const total = (isWork ? workMin : breakMin) * 60;
    if (!isRunning) {
      // 非運行：把剩餘秒數對齊到新總長（避免把使用者暫停中的剩餘秒數重置）
      setSecondsLeft((prev) => Math.min(prev, total));
      baseLeftRef.current = Math.min(secondsLeft, total);
      startedAtMs.current = null;
    }
    // isRunning 刻意不放進依賴，避免暫停觸發初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWork, workMin, breakMin]);

  // 計時核心：從「本輪開始時的剩餘秒數」扣除 elapsed
  useEffect(() => {
    if (!isRunning) return;

    if (startedAtMs.current == null) {
      startedAtMs.current = Date.now();
      baseLeftRef.current = secondsLeft; // 從目前剩餘秒數接著跑
    }

    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startedAtMs.current as number)) / 1000);
      const next = Math.max(0, baseLeftRef.current - elapsed);
      setSecondsLeft(next);

      if (next === 0) {
        clearInterval(id);
        setIsRunning(false);
        startedAtMs.current = null;
        const nextIsWork = !isWork;
        setIsWork(nextIsWork);
        options?.onPhaseSwitch?.(nextIsWork);
      }
    }, 1000);

    return () => clearInterval(id);
    // 不把 secondsLeft 放依賴，避免每秒重設基準
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isWork, options]);

  const totalSec = (isWork ? workMin : breakMin) * 60;
  const progress = 1 - secondsLeft / Math.max(1, totalSec);

  function startPause() {
    if (isRunning) {
      // 暫停：把目前 elapsed 落地到 secondsLeft，且不初始化
      const now = Date.now();
      const elapsed = startedAtMs.current ? Math.floor((now - startedAtMs.current) / 1000) : 0;
      const remain = Math.max(0, baseLeftRef.current - elapsed);
      setSecondsLeft(remain);
      baseLeftRef.current = remain;
      setIsRunning(false);
      startedAtMs.current = null;
    } else {
      if (secondsLeft <= 0) return; // 0 就不啟動
      setIsRunning(true);
      // startedAt/baseLeft 會在 effect 裡設定
    }
  }

  function reset() {
    setIsRunning(false);
    const d = (isWork ? workMin : breakMin) * 60;
    setSecondsLeft(d);
    baseLeftRef.current = d;
    startedAtMs.current = null;
  }

  function skip() {
    setIsRunning(false);
    const next = !isWork;
    setIsWork(next);
    const d = (next ? workMin : breakMin) * 60;
    setSecondsLeft(d);            // 立即有 UI 回饋
    baseLeftRef.current = d;
    startedAtMs.current = null;
    options?.onPhaseSwitch?.(next);
  }

  return {
    workMin, breakMin, setWorkMin, setBreakMin,
    isRunning, isWork, secondsLeft, progress,
    startPause, reset, skip,
  } as const;
}
