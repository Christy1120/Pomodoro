// src/features/pomodoro/components/SlothLottie.tsx
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function SlothLottie({
  className = "",
  onInteract,
}: {
  className?: string;
  onInteract?: () => void;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/sloth.json")               // public/sloth.json
      .then((res) => res.json())
      .then(setData)
      .catch((e) => console.error("載入 sloth.json 失敗：", e));
  }, []);

  if (!data) return null;

  return (
    <div className={className} style={{ width: 320, height: 320 }}>
      <Lottie
        animationData={data}
        loop
        autoplay
        onClick={onInteract}          // ✅ 點樹懶會觸發回呼
        style={{
          width: "100%",
          height: "100%",
          cursor: "pointer",
          filter: "drop-shadow(0 14px 22px rgba(0,0,0,.18))",
        }}
      />
    </div>
  );
}
