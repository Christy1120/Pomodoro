// src/features/pomodoro/components/NavRail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type SectionId = "timer" | "todo" | "music";
type Item = { id: SectionId; label: string };

type Props = {
  items: Item[];
  activeId: SectionId;
  onNavigate: (id: SectionId) => void;
  className?: string;
};

export default function NavRail({
  items,
  activeId,
  onNavigate,
  className = "",
}: Props) {
  // 進場動畫（淡入 + 微上移）
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // 鍵盤 1/2/3 快捷切換（避免在輸入框時觸發）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = (el?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || el?.isContentEditable)
        return;
      const n = Number(e.key);
      if (Number.isFinite(n) && n >= 1 && n <= items.length) onNavigate(items[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, onNavigate]);

  // 目前 active index
  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((x) => x.id === activeId)),
    [items, activeId]
  );

  // indicator 跟著 icon 垂直滑動（用 DOM 量測）
  const wrapperRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicatorY, setIndicatorY] = useState(0);

  // 確保 refs 長度與 items 同步（避免舊 ref 造成量測錯位）
  itemRefs.current.length = items.length;

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    const wrap = wrapperRef.current;
    if (!el || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const center = elRect.top + elRect.height / 2 - wrapRect.top;
    setIndicatorY(center);
  }, [activeIndex, items.length, mounted]);

  return (
    <nav
      aria-label="頁面章節導覽"
      className={clsx(
        // 固定在左側置中（桌機顯示，手機隱藏）
        "hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40",
        // 進場：淡入 + 上移
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        "transition-all duration-500",
        className
      )}
    >
      {/* 玻璃膠囊容器 */}
      <div
        className={clsx(
            "relative rounded-full bg-white/45 backdrop-blur-md",
            "ring-1 ring-transparent shadow-lg", // 顏色設為透明
            "px-3 py-4"
          )}
      >
        {/* 背景細軸（不吃事件，置底） */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-3 bottom-3 -translate-x-1/2 w-px bg-slate-200/70 z-0"
        />

        {/* 滑動指示器（小圓點，不吃事件，置底） */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_0_4px] shadow-rose-200/60 transition-transform duration-300 ease-in-out z-0"
          style={{
            transform: `translateY(${Math.max(0, indicatorY - 3)}px)`, // 3 = dot 半徑
          }}
        />

        {/* icons */}
        <ul ref={wrapperRef} className="flex flex-col items-center gap-4">
          {items.map((it, i) => {
            const active = i === activeIndex;
            return (
              <li key={it.id} className="relative z-10">
                <button
                  ref={(el: HTMLButtonElement | null) => {
                    itemRefs.current[i] = el; // 只賦值，不回傳 callback
                  }}
                  type="button"
                  aria-label={it.label}
                  aria-current={active ? "page" : undefined}
                  title={`${i + 1}. ${it.label}`}
                  onClick={() => onNavigate(it.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={clsx(
                    "group grid place-items-center w-11 h-11 rounded-full outline-none select-none z-10 touch-manipulation",
                    "transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
                    "ring-1 ring-slate-900/10 bg-white/70 backdrop-blur-md",
                    // hover 放大 & 稍微變亮
                    "hover:scale-110 hover:ring-slate-900/20",
                    // focus 可見
                    "focus-visible:ring-2 focus-visible:ring-rose-300",
                    // active 微放大 + 柔和色
                    active ? "scale-110 ring-rose-300/60" : "scale-100"
                  )}
                >
                  <Icon id={it.id} active={active} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* === Icons：單色、乾淨，active/hover 變亮 === */
/* === Icons：單色、乾淨；補償父層縮放，避免筆畫變粗 === */
function Icon({ id, active }: { id: SectionId; active: boolean }) {
    // 基本顏色
    const color = clsx(
      active ? "text-rose-600" : "text-slate-600/70 group-hover:text-slate-800"
    );
  
    // 補償父層 hover/active 的 scale-110（≈ 1 / 1.10 = 0.91）
    const fixScale =
      "transform-gpu transition-transform duration-300 " +
      "group-hover:scale-[.91] group-active:scale-[.91] " +
      (active ? "scale-[.91]" : "scale-100");
  
    if (id === "timer") return <TimerIcon className={clsx("h-[18px] w-[18px]", color, fixScale)} />;
    if (id === "todo")  return <TodoIcon  className={clsx("h-[18px] w-[18px]", color, fixScale)} />;
    return <MusicIcon className={clsx("h-[18px] w-[18px]", color, fixScale)} />;
  }
  
  /* 建議的 SVG：加上 preserveAspectRatio；stroke 稍細一點，看起來更精緻 */
  function TimerIcon({ className = "" }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="13" r="7" />
        <path d="M9 4h6" />
        <path d="M12 10v4" />
      </svg>
    );
  }
  
  function TodoIcon({ className = "" }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="M8 12l2 2 5-5" />
      </svg>
    );
  }
  
  function MusicIcon({ className = "" }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 主幹 */}
        <path d="M14 3v7.5" />
        {/* 左音符 */}
        <circle cx="11" cy="14.5" r="3.5" />
        <path d="M14 10.5c0 0-1.5.5-3 .9" />
        {/* 右音符 */}
        <path d="M20 4v7.5" />
        <circle cx="17" cy="16" r="3.5" />
        <path d="M20 11.5c0 0-1.5.5-3 .9" />
        {/* 橫梁（輕） */}
        <path d="M14 6l6-1.8" />
      </svg>
    );
  }
    