// src/features/pomodoro/hooks/useSoundSettings.ts
import { useEffect, useState } from "react";

export type SoundKind = "ding" | "chime" | "wood";
export type SoundSource = "synth" | "file";

const KEY = "focusflow.soundSettings";

type State = { volume: number; sound: SoundKind; source: SoundSource };

const DEFAULTS: State = { volume: 0.9, sound: "chime", source: "synth" };

export function useSoundSettings() {
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [sound, setSound] = useState<SoundKind>(DEFAULTS.sound);
  const [source, setSource] = useState<SoundSource>(DEFAULTS.source);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        if (typeof parsed.volume === "number") setVolume(clamp01(parsed.volume));
        if (parsed.sound === "ding" || parsed.sound === "chime" || parsed.sound === "wood") {
          setSound(parsed.sound);
        }
        if (parsed.source === "synth" || parsed.source === "file") {
          setSource(parsed.source);
        }
      }
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      const data: State = { volume, sound, source };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }, [volume, sound, source]);

  return { volume, setVolume, sound, setSound, source, setSource };
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
