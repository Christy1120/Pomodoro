// src/features/pomodoro/components/TomatoStats.tsx

type Props = {
  today: number;
  onResetToday: () => void;
  onOpenHistory: () => void;
};

export default function TomatoStats({ today, onResetToday, onOpenHistory }: Props) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 shadow">
        <span className="text-lg">🍅</span>
        <span className="font-semibold">{today}</span>
        <span className="text-slate-500">今日番茄</span>
      </div>

      <button
        onClick={onOpenHistory}
        className="rounded-full bg-slate-800 text-white px-3 py-1 text-xs shadow hover:bg-slate-900"
      >
        歷史紀錄
      </button>

      <button
        onClick={onResetToday}
        className="ml-auto text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1"
        title="將今日番茄清零（不影響歷史）"
      >
        清零今日
      </button>
    </div>
  );
}
