import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeartBurst from "./HeartBurst";
import { PET_POP_URL, STRETCH_SWISH_URL } from "../utils/sfx";

export default function SlothBuddy({
  mood,
  onSay,
}: {
  mood: "sleep" | "awake";
  onSay?: (line: string) => void;
}) {
  const [pet, setPet] = useState(false);
  const [stretch, setStretch] = useState(false);
  const petAudio = useRef<HTMLAudioElement | null>(null);
  const stretchAudio = useRef<HTMLAudioElement | null>(null);

  // 休息進場：伸懶腰一次
  useEffect(() => {
    if (mood === "awake") {
      setStretch(true);
      const t = setTimeout(() => setStretch(false), 1200);
      if (stretchAudio.current) {
        try { stretchAudio.current.currentTime = 0; void stretchAudio.current.play(); } catch {}
      }
      onSay?.("起身動一動，伸展一下～");
      return () => clearTimeout(t);
    }
  }, [mood, onSay]);

  // 隨機眨眼
  const [blinkKey, setBlinkKey] = useState(0);
  useEffect(() => {
    let ok = true;
    (function loop() {
      setTimeout(() => { if (!ok) return; setBlinkKey(v => v + 1); loop(); }, 3000 + Math.random() * 3000);
    })();
    return () => { ok = false; };
  }, []);

  function handlePet() {
    setPet(true);
    if (petAudio.current) {
      try { petAudio.current.currentTime = 0; void petAudio.current.play(); } catch {}
    }
    onSay?.("嗯嗯～被摸頭好舒服 (˶ˊᵕˋ˵) ");
    setTimeout(() => setPet(false), 800);
  }

  return (
    <div className="relative w-[320px] h-[320px]">
      {/* 音效 */}
      <audio ref={petAudio} src={PET_POP_URL} preload="auto" />
      <audio ref={stretchAudio} src={STRETCH_SWISH_URL} preload="auto" />

      {/* 整體有點斜，像靠著躺 */}
      <motion.svg
        width="320" height="320" viewBox="0 0 320 320"
        initial={false}
        animate={{ rotate: mood === "sleep" ? -6 : -4, y: mood === "sleep" ? 2 : 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 12 }}
        style={{ overflow: "visible", cursor: "pointer" }}
        onPointerDown={handlePet}
      >
        <defs>
          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0002" />
          </filter>
          <linearGradient id="furBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9b7a5e"/>
            <stop offset="100%" stopColor="#7b5a3a"/>
          </linearGradient>
          <linearGradient id="belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0e2c7"/>
            <stop offset="100%" stopColor="#e5d3b3"/>
          </linearGradient>
          <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbf3e3"/>
            <stop offset="100%" stopColor="#f3e6cf"/>
          </linearGradient>
        </defs>

        {/* 身體（呼吸） */}
        <motion.ellipse
          cx="160" cy="195" rx="105" ry="90"
          fill="url(#furBody)" filter="url(#softShadow)"
          animate={{ scaleY: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* 肚皮 */}
        <ellipse cx="160" cy="205" rx="85" ry="70" fill="url(#belly)" />

        {/* 手臂（break 伸懶腰） */}
        <motion.ellipse
          cx="80" cy="200" rx="46" ry="34" fill="#8c6b4f"
          animate={stretch ? { rotate: [-14, 30, -8], originX: "80px", originY: "200px" } : {}}
          transition={{ duration: 1.1 }}
        />
        <motion.ellipse
          cx="240" cy="200" rx="46" ry="34" fill="#8c6b4f"
          animate={stretch ? { rotate: [14, -30, 8], originX: "240px", originY: "200px" } : {}}
          transition={{ duration: 1.1 }}
        />

        {/* 頭（奶油臉 + 深色眼罩） */}
        <g transform="translate(0,-10)">
          <ellipse cx="160" cy="120" rx="102" ry="72" fill="url(#face)" stroke="#d8b98b" strokeWidth="2" />
          {/* 深色眼罩輪廓（更像照片） */}
          <path
            d="M70,120c24,-22 65,-28 90,-28s66,6 90,28c-24,22 -65,28 -90,28s-66,-6 -90,-28z"
            fill="#4e3f33" opacity="0.55"
          />
          {/* 左右深色眼斑 */}
          <ellipse cx="118" cy="132" rx="18" ry="13" fill="#4e3f33" />
          <ellipse cx="202" cy="132" rx="18" ry="13" fill="#4e3f33" />
          {/* 眼球（眨眼） */}
          <AnimatePresence mode="popLayout">
            <motion.circle key={`l-${blinkKey}`} cx="118" cy="132" r="6.5" fill="#0f172a"
              initial={{ scaleY: 1 }} animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 0.12 }} />
            <motion.circle key={`r-${blinkKey}`} cx="202" cy="132" r="6.5" fill="#0f172a"
              initial={{ scaleY: 1 }} animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 0.12 }} />
          </AnimatePresence>
          {/* 鼻口粉色（短橢圓） */}
          <ellipse cx="160" cy="152" rx="22" ry="9" fill="#ef86a9" />
        </g>

        {/* 腳掌（短短的圓） */}
        <ellipse cx="120" cy="268" rx="26" ry="20" fill="#8c6b4f" />
        <ellipse cx="200" cy="268" rx="26" ry="20" fill="#8c6b4f" />
      </motion.svg>

      {/* 冒愛心粒子 */}
      <AnimatePresence>{pet && <HeartBurst />}</AnimatePresence>
    </div>
  );
}
