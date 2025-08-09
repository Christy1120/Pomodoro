// src/features/pomodoro/PomodoroPro.tsx
import React, { useMemo, useRef, useState } from "react";
import { usePomodoro } from "./hooks/usePomodoro";
import { BEEP_DATA_URL, playBeep } from "./utils/audio";

// UI components
import TimerDisplay from "./components/TimerDisplay";
import NumberInput from "./components/NumberInput";
import IconButton from "./components/IconButton";
import ModeBadge from "./components/ModeBadge";
import SpeechBubble from "./components/SpeechBubble";
import SlothLottie from "./components/SlothLottie";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "./components/icons";
import YouTubePlaylist from "./components/YouTubePlaylist";

// ★ 番茄統計（Hook + 元件 + 圖表）
import { useTomatoes } from "./hooks/useTomatoes";
import TomatoStats from "./components/TomatoStats";
import TomatoHistoryModal from "./components/TomatoHistoryModal";

export default function PomodoroPro() {
  const [interacted, setInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const card = "bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 md:p-8";

  const quotes = useMemo(
    () => [
      "慢慢來也沒關係，我在這裡陪你～",
      "伸個懶腰，再專注一下下就好。",
      "你又離理想中的自己更近一步了！",
      "補充水份，呼吸一下再上。",
      "好耶～我最喜歡你認真專注的樣子！",
    ],
    []
  );
  const [bubble, setBubble] = useState("今天也一起加油嗎？");

  // ★ 番茄統計：今日 / 歷史(byDate)
  const {
    today: tomatoToday,
    byDate,
    bump,        // 完成一顆番茄就呼叫
    resetToday,  // 清零今日
  } = useTomatoes();

  // 番茄計時核心
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
      // ★ 切到「休息」代表剛完成一顆番茄
      if (!nextIsWork) bump();

      setBubble(nextIsWork ? "回到專注模式～一起加油！" : "休息一下，伸展身體～");
      if (interacted) playBeep(audioRef.current);
    },
  });

  // 顯示 mm:ss
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 text-slate-800 relative">
      {/* 鈴聲 */}
      <audio ref={audioRef} src={BEEP_DATA_URL} preload="auto" />

      {/* 版心：卡片同寬 */}
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* 標題列 */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            FocusFlow Pomodoro
          </h1>
          <ModeBadge isWork={isWork} />
        </header>

        {/* ★ 番茄統計（乾淨膠囊列） */}
        <TomatoStats
          today={tomatoToday}
          onResetToday={resetToday}
          onOpenHistory={() => setHistoryOpen(true)}
        />

        {/* 計時器卡片 */}
        <section className={card}>
          <div className="flex flex-col items-center">
            <TimerDisplay mm={mm} ss={ss} progress={progress} isWork={isWork} />
            <p className="mt-2 text-slate-500">{isWork ? "專注中…" : "休息中…"}</p>

            {/* 工作 / 休息時間調整 */}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xl">
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

            {/* 控制按鈕 */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <IconButton
                title={isRunning ? "暫停" : "開始"}
                onClick={() => {
                  setInteracted(true);
                  startPause();
                }}
                icon={isRunning ? PauseIcon : PlayIcon}
              />
              <IconButton title="重置" onClick={reset} icon={ResetIcon} />
              <IconButton title="跳過" onClick={skip} icon={SkipIcon} />
            </div>
          </div>
        </section>

        {/* YouTube 清單卡片（與計時器一致的樣式） */}
        <section className={card}>
          <YouTubePlaylist />
        </section>

        <footer className="text-center text-xs text-slate-500">
          小技巧：第一次按下開始後，瀏覽器才允許自動播放鈴聲。
        </footer>
      </div>

      {/* 漂浮 Lottie 樹懶（不擋 UI） */}
      <div className="fixed right-4 bottom-4 sm:right-10 sm:bottom-10 z-50 pointer-events-none">
        <div
          className="pointer-events-auto"
          onClick={() => {
            const q = quotes[Math.floor(Math.random() * quotes.length)];
            setBubble(q);
          }}
        >
          <SlothLottie />
        </div>
        <div className="mt-2">
          <SpeechBubble text={bubble} />
        </div>
      </div>

      {/* ★ 歷史圖表 Modal（日 / 月） */}
      <TomatoHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        byDate={byDate}
      />
    </div>
  );
}
