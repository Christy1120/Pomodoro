// File: src/features/pomodoro/PomodoroPro.tsx
import React, { useMemo, useRef, useState } from "react";
import { usePomodoro } from "./hooks/usePomodoro";
import { BEEP_DATA_URL, playBeep } from "./utils/audio";
import TimerDisplay from "./components/TimerDisplay";
import NumberInput from "./components/NumberInput";
import IconButton from "./components/IconButton";
import ModeBadge from "./components/ModeBadge";
import SlothBuddy from "./components/SlothBuddy";
import SpeechBubble from "./components/SpeechBubble";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "./components/icons";

export default function PomodoroPro() {
  // 只保留容器邏輯；計時交給 hook
  const [interacted, setInteracted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const quotes = useMemo<string[]>(
    () => [
      "慢慢來也沒關係，我在這裡陪你～",
      "伸個懶腰，再專注一下下就好。",
      "你又離理想中的自己更近一步了！",
      "補充水份，呼吸一下再上。",
      "好耶～我最喜歡你認真專注的樣子！",
    ],
    []
  );
  const [bubble, setBubble] = useState<string>("今天也一起加油嗎？");

  const {
    workMin,
    breakMin,
    setWorkMin,
    setBreakMin,
    isRunning,
    isWork,
    secondsLeft,
    progress,
    startPause,
    reset,
    skip,
  } = usePomodoro({
    initialWork: 25,
    initialBreak: 5,
    onPhaseSwitch: (nextIsWork) => {
      setBubble(nextIsWork ? "回到專注模式～一起加油！" : "休息一下，伸展身體～");
      if (interacted) playBeep(audioRef.current);
    },
  });

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 text-slate-800">
      <audio ref={audioRef} src={BEEP_DATA_URL} preload="auto" />

      <div className="mx-auto max-w-5xl p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FocusFlow Pomodoro</h1>
          <ModeBadge isWork={isWork} />
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* 左側：番茄鐘 */}
          <section className="bg-white/80 backdrop-blur rounded-2xl shadow p-6 flex flex-col justify-between">
            <TimerDisplay mm={mm} ss={ss} progress={progress} isWork={isWork} />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <NumberInput
                label="工作(分)"
                value={workMin}
                min={1}
                max={120}
                onChange={setWorkMin}
                disabled={isRunning}
              />
              <NumberInput
                label="休息(分)"
                value={breakMin}
                min={1}
                max={60}
                onChange={setBreakMin}
                disabled={isRunning}
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <IconButton
                title={isRunning ? "暫停" : "開始"}
                onClick={() => { setInteracted(true); startPause(); }}
                icon={isRunning ? PauseIcon : PlayIcon}
              />
              <IconButton title="重置" onClick={reset} icon={ResetIcon} />
              <IconButton title="跳過" onClick={skip} icon={SkipIcon} />
            </div>
          </section>

          {/* 右側：互動樹懶 */}
          <section className="relative bg-white/80 backdrop-blur rounded-2xl shadow p-6 overflow-hidden">
            <SlothBuddy
              mood={isWork ? "sleep" : "awake"}
              onInteract={() => {
                setInteracted(true);
                const q = quotes[Math.floor(Math.random() * quotes.length)];
                setBubble(q);
              }}
            />
            <SpeechBubble text={bubble} />
          </section>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-500">
          小技巧：第一次按下開始後，瀏覽器才允許自動播放鈴聲。
        </footer>
      </div>
    </div>
  );
}
