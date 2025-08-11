
export default function ModeBadge({ isWork }:{ isWork:boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isWork ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${isWork ? "bg-rose-500" : "bg-emerald-500"}`} />
      {isWork ? "專注" : "休息"}
    </span>
  );
}