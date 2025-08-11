// src/features/pomodoro/utils/audio.ts
let _ctx: AudioContext | null = null;
function getCtx() {
  if (!_ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    _ctx = new AC();
  }
  return _ctx!;
}

export type SoundKind = "ding" | "chime" | "wood";

export const BEEP_DATA_URL =
  "data:audio/wav;base64,UklGRlYAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAAAAP8AAAD/AAAA/wAAAP8AAP//AAAA//8AAP8A/wD/AAAA/wAAAP8AAAD/AAAA/wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP8=";

/** 第一次用戶點擊時呼叫，解鎖瀏覽器音訊 */
export async function primeAudio(el?: HTMLAudioElement | null) {
  try {
    if (el) {
      el.currentTime = 0;
      await el.play();
      el.pause();
      el.currentTime = 0;
    }
  } catch {}
  try {
    await getCtx().resume();
  } catch {}
}

/** 主播放：先試 <audio>（若你換成 mp3/wav），失敗則用 WebAudio 合成 */
export async function playSound(
  opts: { el?: HTMLAudioElement | null; volume?: number; kind?: SoundKind } = {}
) {
  const { el, volume = 0.9, kind = "chime" } = opts;

  // 若你把 <audio src> 換成自己的檔案，這裡可直接用它（並套用音量）
  if (el) {
    try {
      el.volume = clamp01(volume);
      el.currentTime = 0;
      await el.play();
      return;
    } catch {}
  }

  // 後備：WebAudio 合成
  const ctx = getCtx();
  try {
    await ctx.resume();
  } catch {}

  switch (kind) {
    case "ding":
      return ding(ctx, volume);
    case "wood":
      return woodClick(ctx, volume);
    default:
      return chime(ctx, volume);
  }
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

/** 清脆單音 Ding（穿透感） */
function ding(ctx: AudioContext, volume: number) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.value = 880; // A5
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.35 * volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.27);
}

/** 雙音 Chime（更像提示音） */
function chime(ctx: AudioContext, volume: number) {
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.8 * volume;

  // 第一音：E6
  const o1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  o1.type = "sine";
  o1.frequency.value = 1318.5;
  g1.gain.setValueAtTime(0.0001, t0);
  g1.gain.exponentialRampToValueAtTime(0.5, t0 + 0.01);
  g1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
  o1.connect(g1).connect(master);

  // 第二音：A6，稍後進來
  const o2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  o2.type = "sine";
  o2.frequency.value = 1760;
  g2.gain.setValueAtTime(0.0001, t0 + 0.06);
  g2.gain.exponentialRampToValueAtTime(0.4, t0 + 0.08);
  g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
  o2.connect(g2).connect(master);

  // 輕微高通，避免低頻悶
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 300;

  master.connect(hp).connect(ctx.destination);

  o1.start(t0);
  o2.start(t0);
  o1.stop(t0 + 0.3);
  o2.stop(t0 + 0.35);
}

/** 木質感 Click（像木魚/卡嗒） */
function woodClick(ctx: AudioContext, volume: number) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const bp = ctx.createBiquadFilter();

  osc.type = "square";
  osc.frequency.value = 1000;
  bp.type = "bandpass";
  bp.frequency.value = 1500;
  bp.Q.value = 6;

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.6 * volume, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);

  osc.connect(bp).connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.12);
}
