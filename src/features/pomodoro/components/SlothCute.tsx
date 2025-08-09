import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SlothCute({
  mood,              // 'sleep' | 'awake'
  onPet,             // 被點擊（摸頭）
}: {
  mood: "sleep" | "awake";
  onPet?: () => void;
}) {
  // 眨眼：每 3~6 秒一次
  const [blinkKey, setBlinkKey] = useState(0);
  useEffect(() => {
    let live = true;
    const loop = () => {
      const d = 3000 + Math.random() * 3000;
      setTimeout(() => { if (!live) return; setBlinkKey(k => k + 1); loop(); }, d);
    };
    loop();
    return () => { live = false; };
  }, []);

  const sway = mood === "sleep" ? [-1.5, 0, 1.5, 0, -1.5] : [-0.5, 0, 0.5, 0, -0.5];

  return (
    <motion.svg
      width="280" height="360" viewBox="0 0 280 360"
      initial={false}
      animate={{ rotate: sway }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      onPointerDown={() => onPet?.()}
      style={{ cursor: "pointer", overflow: "visible", filter: "drop-shadow(0 16px 28px rgba(0,0,0,.15))" }}
    >
      <defs>
        <linearGradient id="fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9b7a5e" />
          <stop offset="100%" stopColor="#7b5a3a" />
        </linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf3e3" />
          <stop offset="100%" stopColor="#f3e6cf" />
        </linearGradient>
      </defs>

      {/* 身體（呼吸） */}
      <motion.g animate={{ scaleY: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="74" y="110" width="132" height="200" rx="60" fill="url(#fur)" />
        {/* 身上的毛痕 */}
        <g stroke="#6d5038" strokeWidth="2" strokeLinecap="round" opacity=".5">
          <path d="M110 160 q-6 10 0 20" />
          <path d="M170 160 q6 10 0 20" />
          <path d="M120 210 q-4 8 0 16" />
          <path d="M160 210 q4 8 0 16" />
        </g>
        {/* 腿 */}
        <rect x="90" y="300" width="40" height="44" rx="20" fill="#7f5f44" />
        <rect x="150" y="300" width="40" height="44" rx="20" fill="#7f5f44" />
      </motion.g>

      {/* 手臂：休息狀態伸懶腰 */}
      <motion.rect x="52" y="150" width="40" height="120" rx="20" fill="#7f5f44"
        animate={mood === "awake" ? { rotate: [-12, 22, -6], originX: 72, originY: 150 } : {}}
        transition={{ duration: 1.1 }}
      />
      <motion.rect x="188" y="150" width="40" height="120" rx="20" fill="#7f5f44"
        animate={mood === "awake" ? { rotate: [12, -22, 6], originX: 208, originY: 150 } : {}}
        transition={{ duration: 1.1 }}
      />

      {/* 頭 */}
      <g transform="translate(0,-8)">
        <rect x="70" y="40" width="140" height="120" rx="60" fill="url(#fur)" stroke="#6d5038" strokeWidth="3" />
        {/* 臉（奶油色） */}
        <rect x="88" y="68" width="104" height="84" rx="42" fill="url(#face)" />
        {/* 深色眼罩 */}
        <path d="M95 108c20-22 50-26 45-26s25 4 45 26c-20 22-50 26-45 26s-25-4-45-26z" fill="#4e3f33" opacity=".55" />
        {/* 左右眼斑 */}
        <ellipse cx="118" cy="118" rx="16" ry="12" fill="#4e3f33" />
        <ellipse cx="162" cy="118" rx="16" ry="12" fill="#4e3f33" />
        {/* 眼睛（眨眼） */}
        <AnimatePresence mode="popLayout">
          <motion.circle key={`l-${blinkKey}`} cx="118" cy="118" r="6" fill="#0f172a"
            initial={{ scaleY: 1 }} animate={{ scaleY: [1, .1, 1] }} transition={{ duration: .12 }} />
          <motion.circle key={`r-${blinkKey}`} cx="162" cy="118" r="6" fill="#0f172a"
            initial={{ scaleY: 1 }} animate={{ scaleY: [1, .1, 1] }} transition={{ duration: .12 }} />
        </AnimatePresence>
        {/* 鼻子 */}
        <circle cx="140" cy="134" r="6" fill="#6b4e3a" />
        {/* 嘴口（淡色） */}
        <ellipse cx="140" cy="142" rx="14" ry="8" fill="#e8d6bb" />
      </g>
    </motion.svg>
  );
}