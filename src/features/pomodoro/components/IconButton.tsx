import React from "react";

export default function IconButton({ title, onClick, icon: Icon }:{ title:string; onClick:()=>void; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; }) {
  return (
    <button title={title} onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 shadow hover:shadow-md active:scale-95">
      <Icon className="w-5 h-5" />
      <span className="hidden sm:inline text-sm">{title}</span>
    </button>
  );
}