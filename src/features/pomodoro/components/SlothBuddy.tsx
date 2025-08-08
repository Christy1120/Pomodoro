import React from "react";

export default function SlothBuddy({ mood, onInteract }:{ mood: "sleep" | "awake"; onInteract: () => void; }) {
  return (
    <div className="relative h-[360px] flex items-end justify-center select-none">
      <div onClick={onInteract} className="group cursor-pointer" aria-label="sloth buddy">
        <div className="mx-auto w-56 h-56 relative">
          <div className="absolute inset-0 rounded-[48%] bg-amber-200 shadow-xl animate-[breath_3s_ease-in-out_infinite]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-36 rounded-[48%] bg-amber-100" />
          <div className={`absolute -left-3 top-24 w-20 h-16 rounded-[40%] bg-amber-300 origin-top-left ${mood === "awake" ? "animate-[wave_2s_ease-in-out_infinite]" : "rotate-12"}`} />
          <div className="absolute -right-3 top-24 w-20 h-16 rounded-[40%] bg-amber-300 origin-top-right rotate-[-12deg]" />
          <div className="absolute left-1/2 top-10 -translate-x-1/2 w-40 h-28 rounded-[48%] bg-amber-100 border border-amber-300" />
          <div className="absolute left-1/2 top-[76px] -translate-x-1/2 w-36 h-12 rounded-full bg-amber-300/60" />
          <div className="absolute left-1/2 top-[84px] -translate-x-1/2 w-28 flex justify-between px-3">
            <span className={`block w-3 h-3 rounded-full bg-slate-800 ${mood === "sleep" ? "animate-[blink_4s_steps(1)_infinite]" : ""}`} />
            <span className={`block w-3 h-3 rounded-full bg-slate-800 ${mood === "sleep" ? "animate-[blink_4s_steps(1)_infinite]" : ""}`} />
          </div>
          <div className="absolute left-1/2 top-[110px] -translate-x-1/2 w-10 h-3 rounded-full bg-rose-300" />
          <div className="absolute left-8 bottom-0 w-10 h-8 rounded-[40%] bg-amber-300" />
          <div className="absolute right-8 bottom-0 w-10 h-8 rounded-[40%] bg-amber-300" />
        </div>
        <div className="mt-3 text-center text-slate-500 text-sm group-active:scale-95 transition">
          {mood === "sleep" ? "嘘…樹懶在陪你安靜專注" : "休息囉～和樹懶擊掌！"}
        </div>
      </div>

      <style>{`
        @keyframes breath { 0%,100%{transform:scale(1);}50%{transform:scale(1.02);} }
        @keyframes blink { 0%,98%,100%{transform:scaleY(1);} 99%{transform:scaleY(0.1);} }
        @keyframes wave { 0%,100%{transform:rotate(10deg);} 50%{transform:rotate(30deg);} }
      `}</style>
    </div>
  );
}