// components/TimerDisplay.tsx

export default function TimerDisplay({
  mm, ss, progress, isWork,
}: { mm: string; ss: string; progress: number; isWork: boolean }) {
  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ width: 320, margin: "0 auto" }}>
      <svg viewBox="0 0 120 120" style={{ width: "100%", display: "block" }}>
        {/* 背景圈 */}
        <circle cx="60" cy="60" r={R} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        {/* 進度圈 */}
        <circle
          cx="60" cy="60" r={R}
          fill="none"
          stroke={isWork ? "#f43f5e" : "#10b981"}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={(1 - progress) * C}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
        {/* 倒數字 */}
        <text
          x="60" y="60"
          dominantBaseline="middle" textAnchor="middle"
          fontSize="28" fontWeight={700} fill="#0f172a"
        >
          {mm}:{ss}
        </text>
      </svg>
      <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 8 }}>
        {isWork ? "專注中…" : "休息中…"}
      </div>
    </div>
  );
}
