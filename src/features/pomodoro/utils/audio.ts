export const BEEP_DATA_URL = "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA/////wAAACRhcHBsAAAAAAACAAACcQCA/////wAAACRtcDMzAAAAAAABAAACcQCA/////wAAACQAAABkAAACfQAAAf//AACd////AP//AACZ//8AAP//AACd//8A";
export function playBeep(el?: HTMLAudioElement | null) {
  if (!el) return;
  try {
    el.currentTime = 0;
    void el.play();
  } catch (_) {}
}