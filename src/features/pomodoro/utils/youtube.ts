// src/features/pomodoro/utils/youtube.ts
export function extractVideoId(input: string): string | null {
    if (!input) return null;
  
    // 直接是 11 碼影片 ID
    const idLike = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(idLike)) return idLike;
  
    try {
      const url = new URL(input.trim());
      const host = url.hostname.replace(/^www\./, "");
  
      // youtu.be/<id>
      if (host === "youtu.be") {
        const seg = url.pathname.split("/").filter(Boolean)[0];
        return /^[a-zA-Z0-9_-]{11}$/.test(seg) ? seg : null;
      }
  
      // youtube.com/watch?v=<id>
      if (host.endsWith("youtube.com")) {
        const v = url.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      }
    } catch {
      // 不是 URL，就放掉
    }
    return null;
  }
  