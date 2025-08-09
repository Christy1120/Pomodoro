import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import type { YouTubeProps } from "react-youtube";

type Props = {
  videoId: string;
  shouldPlay?: boolean;
  start?: number;
  className?: string; // 外層可加上你想要的卡片樣式
};

export default function YouTubeMini({
  videoId,
  shouldPlay = false,
  start = 0,
  className = "",
}: Props) {
  const playerRef = useRef<YouTubeProps["onReady"] extends (e: infer E) => any
    ? (E & { target: any })["target"]
    : any>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (shouldPlay) p.playVideo();
    else p.pauseVideo();
  }, [shouldPlay]);

  return (
    <div className={className}>
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="text-slate-700 font-medium">YouTube 音樂</div>
        <button
          className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
          onClick={() => setOpen((v) => !v)}
          title={open ? "收合" : "展開"}
        >
          {open ? "－" : "＋"}
        </button>
      </div>

      {open && (
        // ✅ 比例盒：調整 paddingTop 就能改高度比例
        // 16:9  → 56.25%
        // 16:10 → 62.5%（比較高、縮圖看起來更大）
        <div className="mt-3 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/60 bg-white/60">
          <div className="relative w-full" style={{ paddingTop: "62.5%" }}>
            <YouTube
              videoId={videoId}
              onReady={(e) => {
                playerRef.current = e.target;
                e.target.mute(); // 避免自動播放受阻
                if (start > 0) e.target.seekTo(start, true);
                if (shouldPlay) e.target.playVideo();
              }}
              opts={{
                // 這兩個還是要給 100%，但真正控制高度的是外層比例盒
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 0,
                  controls: 1,
                  rel: 0,
                  modestbranding: 1,
                  playsinline: 1,
                },
              }}
              // 讓 iframe 鋪滿比例盒
              iframeClassName="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
