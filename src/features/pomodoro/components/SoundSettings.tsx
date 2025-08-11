// src/features/pomodoro/components/SoundSettings.tsx
import type { SoundKind } from "../hooks/useSoundSettings";
import type { SoundSource } from "../hooks/useSoundSettings";

type Props = {
  volume: number;
  setVolume: (v: number) => void;
  sound: SoundKind;
  setSound: (s: SoundKind) => void;
  source: SoundSource;
  setSource: (s: SoundSource) => void;
  onTest?: () => void;
};

export default function SoundSettings({
  volume, setVolume, sound, setSound, source, setSource, onTest,
}: Props) {
  return (
    <div className="space-y-5">
      {/* 音源 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600 w-20">音源</span>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={source === "synth"}
            onChange={() => setSource("synth")}
          />
          <span className="text-sm">合成音效</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={source === "file"}
            onChange={() => setSource("file")}
          />
          <span className="text-sm">檔案音效</span>
        </label>
      </div>

      {/* 音效種類（共用 chime/ding/wood，來源不同而已） */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 w-20">音效</span>
        <select
          value={sound}
          onChange={(e) => setSound(e.target.value as SoundKind)}
          className="px-2 py-1 rounded-lg border border-slate-200 bg-white/80"
        >
          <option value="chime">Chime（提示）</option>
          <option value="ding">Ding（清脆）</option>
          <option value="wood">Wood（木質）</option>
        </select>
      </div>

      {/* 音量 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 w-20">音量</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="tabular-nums w-10 text-right text-slate-500">
          {Math.round(volume * 100)}
        </span>
      </div>

      {/* 檔案提示 */}
      {source === "file" && (
        <p className="text-xs text-slate-500">
          請將音效放在 <code>public/sounds/</code>：
          <code>chime.mp3</code>、<code>soft-ding.mp3</code>、<code>wood-click.mp3</code>
        </p>
      )}

      <div className="pt-1">
        <button
          type="button"
          onClick={onTest}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700"
        >
          試聽
        </button>
      </div>
    </div>
  );
}
