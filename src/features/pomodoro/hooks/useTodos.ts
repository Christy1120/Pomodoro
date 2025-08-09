// src/features/pomodoro/hooks/useTodos.ts
import { useEffect, useMemo, useState } from "react";

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

const LS_KEY = "pomodoro_sloth_todos";

export type Filter = "all" | "active" | "done";

export function useTodos() {
  const [items, setItems] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  // 讀取
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Todo[];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {}
  }, []);

  // 寫入
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (title: string) => {
    const t = title.trim();
    if (!t) return;
    setItems((list) => [
      { id: crypto.randomUUID(), title: t, done: false, createdAt: Date.now() },
      ...list,
    ]);
  };

  const toggle = (id: string) =>
    setItems((list) => list.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));

  const update = (id: string, title: string) =>
    setItems((list) => list.map((it) => (it.id === id ? { ...it, title: title.trim() || it.title } : it)));

  const remove = (id: string) =>
    setItems((list) => list.filter((it) => it.id !== id));

  const clearDone = () =>
    setItems((list) => list.filter((it) => !it.done));

  const activeCount = useMemo(() => items.filter((it) => !it.done).length, [items]);
  const doneCount = items.length - activeCount;

  const filtered = useMemo(() => {
    if (filter === "active") return items.filter((it) => !it.done);
    if (filter === "done") return items.filter((it) => it.done);
    return items;
  }, [items, filter]);

  return {
    items,
    filtered,
    filter,
    setFilter,
    add,
    toggle,
    update,
    remove,
    clearDone,
    counts: { all: items.length, active: activeCount, done: doneCount },
  };
}
