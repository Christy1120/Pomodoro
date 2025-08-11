// src/features/pomodoro/PomodoroPro.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePomodoro } from "./hooks/usePomodoro";
import { BEEP_DATA_URL, primeAudio, playSound } from "./utils/audio";

import TimerDisplay from "./components/TimerDisplay";
import NumberInput from "./components/NumberInput";
import IconButton from "./components/IconButton";
import ModeBadge from "./components/ModeBadge";
import SpeechBubble from "./components/SpeechBubble";
import SlothLottie from "./components/SlothLottie";
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from "./components/icons";
import YouTubePlaylist from "./components/YouTubePlaylist";

import { useTomatoes } from "./hooks/useTomatoes";
import TomatoStats from "./components/TomatoStats";
import TomatoHistoryModal from "./components/TomatoHistoryModal";
import TodoList from "./components/TodoList";

import NavRail from "./components/NavRail";
import { useTabBranding } from "./hooks/useTabBranding";

import { useSoundSettings } from "./hooks/useSoundSettings";
import SoundSettings from "./components/SoundSettings";

// 🔔 大聲公 icon（設定入口）
import { Megaphone } from "lucide-react";

type SectionId = "timer" | "todo" | "music";

// 🔊 檔案對應（可依你的檔名調整）
const FILE_MAP: Record<"chime" | "ding" | "wood", string> = {
  chime: "/sounds/chime.mp3",
  ding: "/sounds/soft-ding.mp3",
  wood: "/sounds/wood-click.mp3",
};

export default function PomodoroPro() {
  const [interacted, setInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { volume, setVolume, sound, setSound, source, setSource } = useSoundSettings();

  const card =
    "bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 md:p-8";

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
  const DEFAULT_YT_IDS = [
    "jfKfPfyJRdk",       // lofi hip hop radio
    "lTRiuFIWV54",       // lofi hip hop radio (alt)
    "DWcJFNfaw9c",       // Relaxing music (示例，可自行替換)
  ];
  const {
    today: tomatoToday,
    byDate,
    bump,
    resetToday,
  } = useTomatoes();

  const {
    workMin, breakMin, setWorkMin, setBreakMin,
    isRunning, isWork, secondsLeft, progress,
    startPause, reset, skip,
  } = usePomodoro({
    initialWork: 25,
    initialBreak: 5,
    onPhaseSwitch: (nextIsWork) => {
      if (!nextIsWork) bump();
      setBubble(nextIsWork ? "回到專注模式～一起加油！" : "休息一下，伸展身體～");

      if (!interacted) return;

      if (source === "synth") {
        // 合成音效（依 sound 切換音色）
        playSound({ volume, kind: sound });
      } else {
        // 檔案音效（用 <audio> 播放當前 src）
        playSound({ el: audioRef.current, volume });
      }
    },
  });

  // 顯示 mm:ss
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // ====== 導覽 ======
  const timerRef = useRef<HTMLDivElement>(null);
  const todoRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("timer");

  function scrollToSection(id: SectionId) {
    setActiveSection(id);
    const map: Record<SectionId, React.RefObject<HTMLDivElement | null>> = {
      timer: timerRef, todo: todoRef, music: musicRef,
    };
    const el = map[id].current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: "smooth" });
  }

  useEffect(() => {
    const sections: Array<{ id: SectionId; el: HTMLElement | null }> = [
      { id: "timer", el: timerRef.current },
      { id: "todo", el: todoRef.current },
      { id: "music", el: musicRef.current },
    ];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const found = sections.find((s) => s.el === visible.target);
        if (found && found.id !== activeSection) setActiveSection(found.id);
      },
      { root: null, rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );
    sections.forEach((s) => s.el && io.observe(s.el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useTabBranding({
    title: isWork ? `${mm}:${ss} — FocusFlow` : `☕ ${mm}:${ss} — FocusFlow`,
    theme: isWork ? "#fb7185" : "#22c55e",
    badgeCount: tomatoToday,
    progress, // 想要保留外圈進度
    focused: isRunning,
    focusStyle: {
      swapHref: "/favicon-focus.svg",           // ✅ 專注用 SVG
      theme: isWork ? "#fb7185" : "#22c55e",
      // 如果你想「專注時不畫進度/數字，保留純 SVG」就加這行：
      // drawOverlaysInFocus: false,
    },
  });
  

  // 👉 當選擇「檔案音效」或音色變更時，更新 <audio> 的 src
  useEffect(() => {
    if (!audioRef.current) return;
    if (source === "file") {
      audioRef.current.src = FILE_MAP[sound];
      audioRef.current.load();
    } else {
      // 合成模式時仍給一個 fallback（不影響實際播放）
      audioRef.current.src = BEEP_DATA_URL;
    }
  }, [source, sound]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 text-slate-800 relative">
      {/* 左側導覽 */}
      <NavRail
        items={[
          { id: "timer", label: "計時器" },
          { id: "todo", label: "待辦清單" },
          { id: "music", label: "音樂" },
        ]}
        activeId={activeSection}
        onNavigate={scrollToSection}
      />

      {/* 鈴聲容器（檔案模式會動態換 src） */}
      <audio ref={audioRef} src={BEEP_DATA_URL} preload="auto" />

      {/* 版心 */}
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* 標題列 + 設定入口（大聲公） */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            FocusFlow Pomodoro
          </h1>
          <div className="flex items-center gap-3">
            <ModeBadge isWork={isWork} />
            <button
              type="button"
              aria-label="開啟音效設定"
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl hover:bg-white/60 active:scale-95 transition"
              title="音效設定"
            >
              <Megaphone size={20} />
            </button>
          </div>
        </header>

        {/* 番茄統計 */}
        <TomatoStats
          today={tomatoToday}
          onResetToday={resetToday}
          onOpenHistory={() => setHistoryOpen(true)}
        />

        {/* 計時器卡片 */}
        <section ref={timerRef} data-id="timer" className={card}>
          <div className="flex flex-col items-center">
            <TimerDisplay mm={mm} ss={ss} progress={progress} isWork={isWork} />
            <p className="mt-2 text-slate-500">{isWork ? "專注中…" : "休息中…"}</p>

            {/* 工作 / 休息時間 */}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xl">
              <NumberInput label="工作(分)" value={workMin} min={1} max={120}
                onChange={setWorkMin} disabled={isRunning}/>
              <NumberInput label="休息(分)" value={breakMin} min={1} max={60}
                onChange={setBreakMin} disabled={isRunning}/>
            </div>

            {/* 控制按鈕 */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <IconButton
                title={isRunning ? "暫停" : "開始"}
                onClick={async () => {
                  setInteracted(true);
                  await primeAudio(audioRef.current); // 解鎖音訊
                  startPause();
                }}
                icon={isRunning ? PauseIcon : PlayIcon}
              />
              <IconButton title="重置" onClick={reset} icon={ResetIcon} />
              <IconButton title="跳過" onClick={skip} icon={SkipIcon} />
            </div>
          </div>
        </section>

        {/* 待辦清單 */}
        <section ref={todoRef} data-id="todo" className={card}>
          <TodoList />
        </section>

        {/* 音樂 */}
        <section ref={musicRef} data-id="music" className={card}>
        <YouTubePlaylist initialIds={DEFAULT_YT_IDS} />
        </section>

        <footer className="text-center text-xs text-slate-500">
          小技巧：第一次按下開始後，瀏覽器才允許自動播放鈴聲。
        </footer>
      </div>

      {/* 樹懶 + 氣泡 */}
      <div className="fixed right-4 bottom-4 sm:right-10 sm:bottom-10 z-50 pointer-events-none">
        <div className="pointer-events-auto" onClick={() => {
          const q = quotes[Math.floor(Math.random() * quotes.length)];
          setBubble(q);
        }}>
          <SlothLottie />
        </div>
        <div className="mt-2">
          <SpeechBubble text={bubble} />
        </div>
      </div>

      {/* 歷史圖表 */}
      <TomatoHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        byDate={byDate}
      />

      {/* 設定面板：音效 */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">音效設定</h2>
              <button
                className="px-2 py-1 rounded-md hover:bg-slate-100"
                onClick={() => setSettingsOpen(false)}
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            <SoundSettings
              volume={volume}
              setVolume={setVolume}
              sound={sound}
              setSound={setSound}
              source={source}
              setSource={setSource}
              onTest={() => {
                if (source === "synth") {
                  playSound({ volume, kind: sound });
                } else {
                  playSound({ el: audioRef.current, volume });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
