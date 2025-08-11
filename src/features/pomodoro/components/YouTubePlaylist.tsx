// src/features/pomodoro/components/YouTubePlaylist.tsx
import  { useEffect, useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";
import { extractVideoId } from "../utils/youtube";

type Item = { id: string; title?: string };

type Props = {
  /** 預設影片 ID（或連結），只有在 localStorage 為空時才套用 */
  initialIds?: string[];
};

const LS_KEY = "pomodoro_sloth_yt_playlist";

export default function YouTubePlaylist({ initialIds = [] }: Props) {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const initedRef = useRef(false);

  // ------------------ 載入 / 儲存 ------------------
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Item[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      } catch {}
    }

    // localStorage 為空：使用預設
    if (initialIds.length > 0) {
      const uniq: string[] = [];
      initialIds.forEach((x) => {
        const id = extractVideoId(x);
        if (id && !uniq.includes(id)) uniq.push(id);
      });
      if (uniq.length > 0) {
        setItems(uniq.map((id) => ({ id })));
        setIdx(0);
      }
    }
  }, [initialIds]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const currentId = items[idx]?.id ?? "";

  // ------------------ 取標題（無金鑰，用 oEmbed） ------------------
  async function fetchTitle(id: string, signal?: AbortSignal): Promise<string | null> {
    try {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
      const res = await fetch(url, { signal });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data?.title === "string" ? data.title : null;
    } catch {
      return null;
    }
  }

  // 對缺標題的項目補上 title（逐一補，避免狂刷）
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      const need = items.filter((x) => !x.title).slice(0, 5);
      for (const it of need) {
        const title = await fetchTitle(it.id, abort.signal);
        if (title) {
          setItems((prev) =>
            prev.map((p) => (p.id === it.id ? { ...p, title } : p))
          );
        }
      }
    })();
    return () => abort.abort();
  }, [items]);

  // ------------------ 操作 ------------------
  const add = () => {
    setErrorMsg(null);
    const id = extractVideoId(input);
    if (!id) {
      setErrorMsg("連結或影片 ID 不正確，請再試一次。");
      return;
    }
    if (items.find((x) => x.id === id)) {
      setErrorMsg("此影片已在清單中。");
      return;
    }
    setItems((prev) => [...prev, { id }]); // 標題會在上方 effect 自動補齊
    setInput("");
    if (items.length === 0) setIdx(0);
  };

  const prev = () => {
    if (items.length === 0) return;
    setIdx((i) => (i - 1 + items.length) % items.length);
  };
  const next = () => {
    if (items.length === 0) return;
    setIdx((i) => (i + 1) % items.length);
  };
  const clear = () => {
    setItems([]);
    setIdx(0);
    setErrorMsg(null);
  };
  const remove = (id: string) => {
    const i = items.findIndex((x) => x.id === id);
    if (i === -1) return;
    const newItems = items.filter((x) => x.id !== id);
    setItems(newItems);
    if (newItems.length === 0) setIdx(0);
    else setIdx((old) => Math.min(old, newItems.length - 1));
  };

  // ------------------ UI ------------------
  const headerHint = useMemo(
    () => "可輸入 YouTube 連結或 11 碼影片 ID 來建立播放清單",
    []
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-900 font-semibold text-lg">YouTube 音樂</div>
          <div className="text-xs text-slate-500 mt-0.5">{headerHint}</div>
        </div>
        <button
          className="text-slate-400 hover:text-slate-600 transition text-xl leading-none"
          onClick={() => setOpen((v) => !v)}
          title={open ? "收合" : "展開"}
        >
          {open ? "−" : "+"}
        </button>
      </div>

      {/* 控制列 */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="貼上 YouTube 連結或影片 ID，如：https://youtu.be/5qap5aO4i9A"
          className="flex-1 min-w-[240px] rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm
                     shadow-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        />
        <button
          onClick={add}
          className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 text-sm shadow-sm"
        >
          加入
        </button>
        <button
          onClick={prev}
          className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-sm"
        >
          ◀ 上一首
        </button>
        <button
          onClick={next}
          className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-sm"
        >
          下一首 ▶
        </button>
        <button
          onClick={clear}
          className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-sm"
        >
          清空
        </button>
      </div>

      {/* 錯誤訊息 */}
      {errorMsg && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {errorMsg}
        </div>
      )}

      {open && (
        <>
          {/* Player */}
          <div className="mt-2">
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-sm bg-black">
              {currentId ? (
                <YouTube
                  videoId={currentId}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                      autoplay: 0,
                      controls: 1,
                      rel: 0,
                      modestbranding: 1,
                      playsinline: 1,
                      iv_load_policy: 3,
                    },
                  }}
                  iframeClassName="absolute inset-0 w-full h-full"
                  onReady={(e) => {
                    playerRef.current = e.target;
                    try {
                      e.target.mute();
                    } catch {}
                  }}
                  onError={(e: any) => {
                    const code = e?.data;
                    let msg = "播放失敗";
                    if (code === 101 || code === 150) msg = "此影片不允許外部嵌入（已跳過）。";
                    else if (code === 100) msg = "影片不存在或已設為私人。";
                    else if (code === 2) msg = "影片 ID 格式錯誤。";
                    else if (code === 5) msg = "HTML5 播放錯誤。";
                    setErrorMsg(msg);
                    if (items.length > 1) next();
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  尚未加入任何影片
                </div>
              )}
            </div>
          </div>

          {/* 清單：顯示標題（沒有就顯示順序號） */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {items.map((it, i) => {
                const label = it.title ? it.title : `第 ${i + 1} 首`;
                return (
                  <div
                    key={it.id}
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm border
                      ${i === idx ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-slate-200"}`}
                    title={it.title ? `${it.title}（${it.id}）` : it.id}
                  >
                    <button
                      onClick={() => setIdx(i)}
                      className="hover:underline"
                    >
                      {label}
                    </button>
                    <button
                      onClick={() => remove(it.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="移除"
                    >
                      刪除
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
