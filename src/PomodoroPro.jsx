import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Bell, Volume2, VolumeX, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Pomodoro Timer with:
 * - Alarm sound when a session ends (uses Web Audio API, no external file)
 * - An adorable interactive sloth buddy that animates, reacts to clicks, and celebrates on completion
 * - Start/Pause/Reset/Skip controls (icon-only, accessible labels)
 * - Simple settings: durations & sound toggle
 * - Optional desktop notification when a session flips (if permitted)
 *
 * Styling: TailwindCSS
 * Icons: lucide-react
 * Animation: framer-motion
 */

export default function PomodoroWithSloth() {
  // Durations (minutes)
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);

  // State
  const [mode, setMode] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [celebrate, setCelebrate] = useState(false);
  const startedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // Format time
  const mmss = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

  // Sync seconds when durations change & not running
  useEffect(() => {
    if (!running) {
      setSecondsLeft((mode === "work" ? workMin : breakMin) * 60);
    }
  }, [workMin, breakMin, mode, running]);

  // Main ticking effect
  useEffect(() => {
    if (!running) {
      clearTick();
      return;
    }
    if (!startedRef.current) startedRef.current = true; // user interacted — helps autoplay policies

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // flip
          onSessionFlip();
          return (mode === "work" ? breakMin : workMin) * 60;
        }
        return s - 1;
      });
    }, 1000);

    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, workMin, breakMin]);

  function clearTick() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function onSessionFlip() {
    // Fire alarm + notify + sloth celebrate
    if (soundOn) playAlarm();
    fireNotification(mode === "work" ? "Time for a break!" : "Back to focus!");
    slothCelebrate();
    // toggle mode
    setMode((m) => (m === "work" ? "break" : "work"));
  }

  function reset() {
    setRunning(false);
    setSecondsLeft((mode === "work" ? workMin : breakMin) * 60);
  }

  function skip() {
    if (soundOn) playAlarm();
    slothCelebrate();
    setMode((m) => (m === "work" ? "break" : "work"));
    setSecondsLeft((prevMode) => ((mode === "work" ? breakMin : workMin) * 60));
  }

  function slothCelebrate() {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1600);
  }

  // Desktop notifications
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      // Don't annoy — only ask once after the user interacts
      const onFirstInteraction = () => {
        if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
        window.removeEventListener("pointerdown", onFirstInteraction);
      };
      window.addEventListener("pointerdown", onFirstInteraction);
      return () => window.removeEventListener("pointerdown", onFirstInteraction);
    }
  }, []);

  function fireNotification(body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("🍅 Pomodoro", { body });
    }
  }

  // Web Audio alarm (no external asset). A short, pleasant tri-tone chirp.
  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.value = 0.08; // gentle volume
      master.connect(ctx.destination);

      const freqs = [880, 1174.66, 1567.98]; // A5, D6, G6
      const now = ctx.currentTime;

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.connect(g);
        g.connect(master);
        const t0 = now + i * 0.2;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.9, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        osc.start(t0);
        osc.stop(t0 + 0.4);
      });

      // soft whoosh tail
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
      noise.buffer = buf;
      const g = ctx.createGain();
      g.gain.value = 0.02;
      noise.connect(g);
      g.connect(master);
      noise.start(now + 0.1);
      noise.stop(now + 0.5);
    } catch (e) {
      // no-op
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-100 via-pink-100 to-amber-100 flex items-center justify-center p-6">
      <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
        {/* Timer Card */}
        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 md:p-8 border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${mode === "work" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {mode === "work" ? "專注中" : "休息中"}
              </span>
              <AnimatePresence>
                {celebrate && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="inline-flex items-center gap-1 text-sm text-rose-600"
                  >
                    <Heart size={16} /> 太棒了！
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <button
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => {
                if (soundOn) playAlarm();
              }}
              aria-label="測試鈴聲"
              title="測試鈴聲"
            >
              <Bell size={18} /> 測試鈴聲
            </button>
          </div>

          <div className="flex flex-col items-center">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-7xl md:text-8xl font-black tracking-wider tabular-nums"
            >
              {mmss}
            </motion.div>

            <div className="mt-6 flex items-center gap-3">
              <IconButton
                label={running ? "暫停" : "開始"}
                onClick={() => setRunning((r) => !r)}
                className={running ? "bg-yellow-500 hover:bg-yellow-600" : "bg-emerald-500 hover:bg-emerald-600"}
              >
                {running ? <Pause /> : <Play />}
              </IconButton>
              <IconButton label="重置" onClick={reset} className="bg-gray-600 hover:bg-gray-700">
                <RotateCcw />
              </IconButton>
              <IconButton label="跳過" onClick={skip} className="bg-blue-600 hover:bg-blue-700">
                <SkipForward />
              </IconButton>
              <IconButton
                label={soundOn ? "關閉音效" : "開啟音效"}
                onClick={() => setSoundOn((s) => !s)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {soundOn ? <Volume2 /> : <VolumeX />}
              </IconButton>
            </div>

            {/* Quick Settings */}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md">
              <DurationInput label="專注（分）" val={workMin} setVal={setWorkMin} min={5} max={120} />
              <DurationInput label="休息（分）" val={breakMin} setVal={setBreakMin} min={1} max={60} />
            </div>
          </div>
        </div>

        {/* Sloth Buddy */}
        <SlothBuddy mode={mode} celebrate={celebrate} onPet={() => setCelebrate(true)} />
      </div>
    </div>
  );
}

function formatTime(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function IconButton({ label, className = "", onClick, children }: { label: string; className?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white shadow-md transition active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      aria-label={label}
      title={label}
    >
      <div className="[&>*]:w-5 [&>*]:h-5" />
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function DurationInput({ label, val, setVal, min = 1, max = 120 }: { label: string; val: number; setVal: (n: number) => void; min?: number; max?: number }) {
  return (
    <label className="flex items-center justify-between gap-3 bg-white/70 border border-white/60 rounded-xl px-4 py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="number"
        className="w-20 bg-transparent text-right font-medium outline-none"
        value={val}
        min={min}
        max={max}
        onChange={(e) => setVal(clampInt(parseInt(e.target.value || "0"), min, max))}
      />
    </label>
  );
}

function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n | 0));
}

/**
 * SlothBuddy — An adorable animated, interactive sloth
 * - Idle sway animation
 * - Blinks periodically
 * - Sleeps during break (with Zzz), perks up during work
 * - Click to pet → shows hearts
 * - Celebrates when a session flips
 */
function SlothBuddy({ mode, celebrate, onPet }: { mode: "work" | "break"; celebrate: boolean; onPet: () => void }) {
  const [blinking, setBlinking] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);

  // Random blink loop
  useEffect(() => {
    let mounted = true;
    function loop() {
      if (!mounted) return;
      const delay = 1200 + Math.random() * 3000;
      setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 140);
        loop();
      }, delay);
    }
    loop();
    return () => {
      mounted = false;
    };
  }, []);

  // hearts on celebrate
  useEffect(() => {
    if (celebrate) spawnHeart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  function spawnHeart() {
    const id = Date.now() + Math.random();
    setHearts((h) => [...h, id]);
    setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1200);
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">你的樹懶夥伴</p>
          <span className="text-xs text-gray-500">{mode === "work" ? "看著你努力中…" : "陪你一起放鬆"}</span>
        </div>

        <div className="relative select-none">
          {/* Floating hearts */}
          <AnimatePresence>
            {hearts.map((id) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0, y: -60 }}
                transition={{ duration: 1.1 }}
                className="absolute left-1/2 -translate-x-1/2 -top-3 text-rose-500"
              >
                <Heart />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Sloth SVG */}
          <motion.div
            className="mx-auto"
            animate={{ rotate: mode === "break" ? 2 : -2 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 2.2, ease: "easeInOut" }}
            onClick={() => {
              spawnHeart();
              onPet();
            }}
            role="img"
            aria-label="可愛的樹懶"
            title="點我摸摸 🖐️"
          >
            <SlothSVG blinking={blinking} sleeping={mode === "break"} />
          </motion.div>

          {/* Zzz when sleeping */}
          <AnimatePresence>
            {mode === "break" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-6 top-3 text-gray-500/80 font-semibold"
              >
                Zzz…
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">點一下可以摸摸他，結束一個循環他會為你歡呼 ✨</p>
      </div>
    </div>
  );
}

function SlothSVG({ blinking, sleeping }: { blinking: boolean; sleeping: boolean }) {
  // Simple cute sloth drawn via SVG; eyes blink via rectangles
  const eyeH = blinking ? 2 : 6;
  const eyeY = 52 + (blinking ? 2 : 0);
  return (
    <svg width="280" height="180" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* branch */}
      <rect x="20" y="140" width="240" height="14" rx="7" fill="#8B5E3C" />
      <circle cx="52" cy="144" r="6" fill="#6E4429" />

      {/* body */}
      <ellipse cx="140" cy="100" rx="90" ry="60" fill="#BFA27E" />
      <ellipse cx="140" cy="108" rx="70" ry="48" fill="#CBB391" />

      {/* head */}
      <circle cx="92" cy="80" r="42" fill="#CBB391" />
      <circle cx="92" cy="82" r="34" fill="#E5D3B8" />

      {/* face mask patches */}
      <ellipse cx="78" cy="78" rx="16" ry="12" fill="#8B6B54" />
      <ellipse cx="106" cy="78" rx="16" ry="12" fill="#8B6B54" />

      {/* eyes */}
      <rect x="72" y={eyeY} width="6" height={eyeH} rx="2" fill="#2D2A26" />
      <rect x="104" y={eyeY} width="6" height={eyeH} rx="2" fill="#2D2A26" />

      {/* nose & mouth */}
      <ellipse cx="88" cy="90" rx="8" ry="6" fill="#2D2A26" />
      <path d="M80 100 Q88 106 96 100" stroke="#2D2A26" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* arms hanging the branch */}
      <path d="M120 120 Q140 130 160 140" stroke="#BFA27E" strokeWidth="20" strokeLinecap="round" />
      <path d="M70 120 Q90 130 110 140" stroke="#BFA27E" strokeWidth="20" strokeLinecap="round" />

      {/* toes */}
      <circle cx="108" cy="146" r="4" fill="#E5D3B8" />
      <circle cx="158" cy="146" r="4" fill="#E5D3B8" />

      {/* sleeping overlay */}
      {sleeping && <rect x="60" y="70" width="64" height="24" rx="12" fill="#FFFFFF" opacity="0.08" />}
    </svg>
  );
}
