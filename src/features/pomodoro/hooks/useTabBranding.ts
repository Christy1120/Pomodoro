// src/features/pomodoro/hooks/useTabBranding.ts
// Drop-in hook for tab title, theme-color, dynamic favicon (progress ring + badge number),
// and focus-mode icon swapping. Robust across browsers.

import { useEffect, useRef } from "react";

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  size: number,
  img: HTMLImageElement
) => void;

// ---- utils: query/update favicon links -----------------------------------
function getIconLinks(): HTMLLinkElement[] {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="alternate icon"]',
  ];
  const set = new Set<HTMLLinkElement>();
  selectors.forEach((sel) =>
    document.querySelectorAll<HTMLLinkElement>(sel).forEach((l) => set.add(l))
  );
  if (set.size === 0) {
    const l = document.createElement("link");
    l.rel = "icon";
    document.head.appendChild(l);
    set.add(l);
  }
  return [...set];
}

function pickPrimaryIconForDrawing(links: HTMLLinkElement[]): HTMLLinkElement {
  // Prefer PNG to avoid canvas tainting issues with some SVGs
  const png = links.find(
    (l) => (l.type || "").includes("png") || (l.href || "").toLowerCase().endsWith(".png")
  );
  return png || links[0];
}

function swapAllFaviconsRaw(href: string) {
  const links = getIconLinks();
  const bust = `${href}${href.includes("?") ? "&" : "?"}v=${Date.now()}`;
  links.forEach((l) => {
    l.href = bust;
    // Some browsers refresh faster if we re-append the node
    const parent = l.parentNode;
    if (parent) {
      parent.removeChild(l);
      parent.appendChild(l);
    }
  });
}

function currentPrimaryHref(): string {
  const links = getIconLinks();
  const primary = pickPrimaryIconForDrawing(links);
  return primary?.href || "/favicon.png";
}

// ---- canvas drawing over a specific base favicon -------------------------
function withFavicon(draw: DrawFn, baseHref?: string) {
  const links = getIconLinks();
  const primary = pickPrimaryIconForDrawing(links);
  const src = baseHref || primary.href || "/favicon.png"; // ⚠️ 用 property，避免 getAttribute 取到舊值

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const size = 64;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      draw(ctx, size, img);
      const dataUrl = c.toDataURL("image/png");
      links.forEach((l) => (l.href = dataUrl));
    } catch (e) {
      // 若 SVG taint 或 toDataURL 失敗，直接退回「純替換」，至少確保 base SVG 被看到
      console.warn("[useTabBranding] fallback to raw swap due to draw error", e);
      swapAllFaviconsRaw(src);
    }
  };
  img.onerror = () => {
    // 若 base 載入失敗 -> 什麼都不畫，避免覆蓋為壞圖
    console.warn("[useTabBranding] base icon load error", src);
  };
  img.src = src;
}

// ---- theme-color meta ----------------------------------------------------
function ensureThemeMeta(): HTMLMetaElement {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  return meta;
}

export function setThemeColor(hex: string) {
  ensureThemeMeta().content = hex;
}

export function setTabTitle(title: string) {
  document.title = title;
}

// ---- overlays: progress + numeric badge (可選 baseHref) ------------------
export function setFaviconProgress(p: number, color = "#fb7185", baseHref?: string) {
  const clamped = Math.max(0, Math.min(1, p));
  withFavicon((ctx, size) => {
    const r = size * 0.45;
    const cx = size / 2;
    const cy = size / 2;
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.lineCap = "round";
    ctx.strokeStyle = `${color}cc`;

    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + clamped * Math.PI * 2);
    ctx.stroke();
  }, baseHref);
}

export function setFaviconBadgeNumber(count: number, color = "#fb7185", baseHref?: string) {
  withFavicon((ctx, size) => {
    if (!count || count <= 0) return;

    const r = Math.round(size * 0.18);
    const x = size - r - 4;
    const y = r + 4;

    ctx.shadowColor = `${color}73`;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    const fontSize = count < 10 ? Math.round(r * 1.3) : Math.round(r * 1.1);
    ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(Math.min(99, count)), x, y + 0.5);
  }, baseHref);
}

// ---- original state capture / restore -----------------------------------
const ORIGINALS = {
  captured: false,
  title: "",
  theme: "",
  iconHref: null as string | null,
};

function captureOriginals() {
  if (ORIGINALS.captured) return;
  ORIGINALS.title = document.title;
  ORIGINALS.theme =
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content || "";
  // 用 property 取當前實際 href
  ORIGINALS.iconHref =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href || null;
  ORIGINALS.captured = true;
}

export function restoreTabBranding() {
  captureOriginals();
  setTabTitle(ORIGINALS.title);
  if (ORIGINALS.theme) setThemeColor(ORIGINALS.theme);
  if (ORIGINALS.iconHref) swapAllFaviconsRaw(ORIGINALS.iconHref);
}

// ---- public API: swap + hook --------------------------------------------
export function swapAllFavicons(href: string) {
  swapAllFaviconsRaw(href);
}

export function useTabBranding({
  title,
  theme,
  badgeCount,
  progress,
  focused,
  focusStyle,
}: {
  title?: string;
  theme?: string;
  badgeCount?: number; // numeric badge (0/undefined = hide)
  progress?: number; // 0..1 ring
  focused?: boolean; // focus mode toggle
  focusStyle?: {
    theme?: string; // theme-color in focus
    swapHref?: string; // icon path in focus (SVG/PNG 都可)
    drawOverlaysInFocus?: boolean; // 預設 true；若要純 SVG 就設 false
  };
}) {
  const mounted = useRef(false);

  useEffect(() => {
    captureOriginals();
    mounted.current = true;
    return () => restoreTabBranding();
  }, []);

  // title & normal theme
  useEffect(() => {
    if (title) setTabTitle(title);
  }, [title]);

  useEffect(() => {
    if (theme) setThemeColor(theme);
  }, [theme]);

  // 根據是否專注，決定疊圖要用的「底圖」
  const baseNormal = ORIGINALS.iconHref || currentPrimaryHref();
  const baseFocus = focusStyle?.swapHref || baseNormal;

  // overlays（一般狀態下）
  useEffect(() => {
    if (!mounted.current) return;
    if (focused && focusStyle?.drawOverlaysInFocus === false) return; // 專注純 SVG，不畫疊圖
    const base = focused ? baseFocus : baseNormal;
    if (typeof progress === "number") setFaviconProgress(progress, undefined, base);
  }, [progress, focused, focusStyle?.drawOverlaysInFocus, baseFocus, baseNormal]);

  useEffect(() => {
    if (!mounted.current) return;
    if (focused && focusStyle?.drawOverlaysInFocus === false) return;
    const base = focused ? baseFocus : baseNormal;
    if (typeof badgeCount === "number") setFaviconBadgeNumber(badgeCount, undefined, base);
  }, [badgeCount, focused, focusStyle?.drawOverlaysInFocus, baseFocus, baseNormal]);

  // focus toggle: 先替換底圖，再（視設定）畫 overlays
  useEffect(() => {
    if (!mounted.current) return;

    if (focused) {
      if (focusStyle?.swapHref) swapAllFaviconsRaw(baseFocus);
      if (focusStyle?.theme) setThemeColor(focusStyle.theme);

      if (focusStyle?.drawOverlaysInFocus !== false) {
        if (typeof progress === "number") setFaviconProgress(progress, undefined, baseFocus);
        if (typeof badgeCount === "number") setFaviconBadgeNumber(badgeCount, undefined, baseFocus);
      }
    } else {
      restoreTabBranding();
      // 回到一般狀態也補一次以確保視覺一致
      if (typeof progress === "number") setFaviconProgress(progress, undefined, baseNormal);
      if (typeof badgeCount === "number") setFaviconBadgeNumber(badgeCount, undefined, baseNormal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, focusStyle?.swapHref, focusStyle?.theme, focusStyle?.drawOverlaysInFocus]);
}
