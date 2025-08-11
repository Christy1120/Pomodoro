// src/features/pomodoro/components/TodoList.tsx
import { useRef, useState } from "react";
import { useTodos } from "../hooks/useTodos";
import type { Filter } from "../hooks/useTodos";

export default function TodoList() {
  const {
    filtered, filter, setFilter,
    add, toggle, update, remove, clearDone, counts,
  } = useTodos();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const submit = () => {
    if (!text.trim()) return;
    add(text);
    setText("");
  };

  const onEditStart = (id: string, _current: string) => {
    setEditingId(id);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };
  

  const onEditCommit = (id: string, v: string) => {
    update(id, v);
    setEditingId(null);
  };

  const filterBtn = (k: Filter, label: string) => (
    <button
      key={k}
      onClick={() => setFilter(k)}
      className={`px-3 py-1.5 rounded-lg text-xs ${
        filter === k ? "bg-white shadow" : "text-slate-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-900 font-semibold text-lg">待辦清單</div>
          <div className="text-xs text-slate-500 mt-0.5">
            按 Enter 新增，點文字可編輯，勾選標記完成
          </div>
        </div>
        <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-1">
          {filterBtn("all", `全部(${counts.all})`)}
          {filterBtn("active", `進行中(${counts.active})`)}
          {filterBtn("done", `已完成(${counts.done})`)}
        </div>
      </div>

      {/* 新增 */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="我要做的事…（按 Enter 新增）"
          className="flex-1 h-11 rounded-lg border border-slate-200 bg-white/80 px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        />
        <button
          onClick={submit}
          className="h-11 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium shadow"
        >
          新增
        </button>
      </div>

      {/* 清單 */}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white/70 overflow-hidden">
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-sm text-slate-400 text-center">目前沒有項目</li>
        )}
        {filtered.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
              className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-200"
            />

            {editingId === t.id ? (
              <input
                ref={editInputRef}
                defaultValue={t.title}
                onBlur={(e) => onEditCommit(t.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onEditCommit(t.id, (e.target as HTMLInputElement).value);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-rose-200"
              />
            ) : (
              <button
                className={`flex-1 text-left text-sm ${
                  t.done ? "line-through text-slate-400" : "text-slate-800"
                }`}
                onClick={() => onEditStart(t.id, t.title)}
                title="點擊編輯"
              >
                {t.title}
              </button>
            )}

            <button
              onClick={() => remove(t.id)}
              className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-rose-600 text-sm"
              title="刪除"
            >
              刪除
            </button>
          </li>
        ))}
      </ul>

      {/* Footer 操作（小螢幕也能切換篩選） */}
      <div className="flex items-center justify-between text-xs">
        <div className="sm:hidden inline-flex items-center gap-1">
          <span className="text-slate-500">篩選：</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1"
          >
            <option value="all">全部</option>
            <option value="active">進行中</option>
            <option value="done">已完成</option>
          </select>
        </div>

        <button
          onClick={clearDone}
          className="ml-auto rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1"
        >
          清除已完成
        </button>
      </div>
    </div>
  );
}
