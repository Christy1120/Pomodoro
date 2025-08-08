import React from "react";

export default function SpeechBubble({ text }:{ text:string }) {
  return (
    <div className="absolute right-6 top-6 max-w-xs">
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow px-4 py-3 text-sm leading-6">
        {text}
        <span className="absolute -left-2 top-6 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white drop-shadow" />
      </div>
    </div>
  );
}
