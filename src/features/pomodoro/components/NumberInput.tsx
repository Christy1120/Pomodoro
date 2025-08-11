export default function NumberInput({ label, value, min, max, onChange, disabled }:{ label:string; value:number; min:number; max:number; onChange:(v:number)=>void; disabled:boolean; }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div>
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <div className={`flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-2 ${disabled ? "opacity-60" : ""}`}>
        <button className="px-3 py-2 rounded-lg bg-white shadow border hover:shadow-md active:scale-95" onClick={dec} disabled={disabled}>-</button>
        <input type="number" className="w-full text-center bg-transparent outline-none" min={min} max={max} value={value} onChange={(e)=>onChange(Number(e.target.value))} disabled={disabled} />
        <button className="px-3 py-2 rounded-lg bg-white shadow border hover:shadow-md active:scale-95" onClick={inc} disabled={disabled}>+</button>
      </div>
    </div>
  );
}
