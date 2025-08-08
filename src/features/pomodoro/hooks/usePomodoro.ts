import { useEffect, useState } from "react";

export interface UsePomodoroOptions {
  initialWork?: number; // 分鐘
  initialBreak?: number; // 分鐘
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

  // 計時器核心
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false);
          const nextIsWork = !isWork;
          setIsWork(nextIsWork);
          setSecondsLeft((nextIsWork ? workMin : breakMin) * 60);
          options?.onPhaseSwitch?.(nextIsWork);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, isWork, workMin, breakMin]);

  // 設定改變時同步秒數（僅在非運行時生效更直覺）
  useEffect(() => {
    if (!isRunning) setSecondsLeft((isWork ? workMin : breakMin) * 60);
  }, [workMin, breakMin, isWork, isRunning]);

  const totalSec = (isWork ? workMin : breakMin) * 60;
  const progress = 1 - secondsLeft / Math.max(1, totalSec);

  function startPause() { setIsRunning((r) => !r); }
  function reset() { setIsRunning(false); setSecondsLeft((isWork ? workMin : breakMin) * 60); }
  function skip() { setIsRunning(false); const next = !isWork; setIsWork(next); setSecondsLeft((next ? workMin : breakMin) * 60); options?.onPhaseSwitch?.(next); }

  return {
    workMin, breakMin, setWorkMin, setBreakMin,
    isRunning, isWork, secondsLeft, progress,
    startPause, reset, skip,
  } as const;
}