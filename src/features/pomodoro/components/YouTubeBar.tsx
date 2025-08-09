import { useEffect, useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";

type Track = { id: string; title: string };

export default function YouTubeBar({
  tracks = [{ id: "jfKfPfyJRdk", title: "Lofi hip hop radio — relax/study" }],
  shouldPlay = false,
  start = 0,
  className = "",
}: {
  tracks?: Track[];
  shouldPlay?: boolean;
  start?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const playerRef = useRef<any>(null);
  const safeTracks = tracks.length ? tracks : [{ id: "jfKfPfyJRdk", title: "Lofi hip hop" }];
  const current = useMemo(() => safeTracks[(index + safeTracks.length) % safeTracks.length], [safeTracks, index]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (shouldPlay) p.playVideo();
    else p.pauseVideo();
  }, [shouldPlay]);

  const loadByIndex = (i: number) => {
    const next = (i % safeTracks.length + safeTracks.length) % safeTracks.length;
    setIndex(next);
    const p = playerRef.current;
    if (p) p.loadVideoById({ videoId: safeTracks[next].id, startSeconds: start });
  };

  return (
    <div className={`rounded-[28px] border-2 border-rose-400 bg-white/80 backdrop-blur px-6 py-4 shadow ${className}`}>
      <div className="text-center text-2xl font-semibold text-rose-500 select-none">
        {current?.title ?? "music name"}
      </div>

      <div className="mt-3 flex items-center justify-center gap-6">
        <button className="text-black hover:scale-110 transition" onClick={() => loadByIndex(index - 1)} title="上一首">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6v12l-10-6z"/></svg>
        </button>

        <button
          className="flex items-center gap-2"
          onClick={async () => {
            const p = playerRef.current;
            if (!p) return;
            const state = await p.getPlayerState?.(); // 1 playing, 2 paused
            if (state === 1) p.pauseVideo();
            else p.playVideo();
          }}
          title="播放/暫停"
        >
          <span className="inline-block h-8 w-2 rounded bg-rose-500" />
          <span className="inline-block h-8 w-2 rounded bg-rose-500" />
        </button>

        <button className="text-black hover:scale-110 transition" onClick={() => loadByIndex(index + 1)} title="下一首">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 6l10 6-10 6zM6 6h2v12H6z" transform="translate(-6 0)"/>
          </svg>
        </button>
      </div>

      {/* 隱藏的 YouTube iframe，只拿聲音 */}
      <div className="absolute w-0 h-0 overflow-hidden">
        <YouTube
          videoId={current.id}
          onReady={(e) => {
            playerRef.current = e.target;
            e.target.mute(); // 讓自動播放不被擋
            e.target.cueVideoById({ videoId: current.id, startSeconds: start });
            if (shouldPlay) e.target.playVideo();
          }}
          onEnd={() => loadByIndex(index + 1)}
          onError={(err) => console.error("YT error:", err)}
          opts={{
            width: "0",
            height: "0",
            playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
          }}
        />
      </div>
    </div>
  );
}
