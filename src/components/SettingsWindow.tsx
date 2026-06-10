import { Sparkles, Volume2, VolumeX, X } from "lucide-react";

export type GameSettings = {
  sound: boolean;
  effects: boolean;
};

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
};

export function SettingsWindow({ settings, onChange, onClose }: Props) {
  const setValue = (patch: Partial<GameSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-cyan-400/25 bg-[#080d18] text-white shadow-[0_30px_90px_-30px_rgba(34,211,238,0.5)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <h2 className="font-['Press_Start_2P'] text-sm text-cyan-200">Настройки</h2>
            <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/40">
              Shadow District config
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Закрыть настройки"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <button
            type="button"
            onClick={() => setValue({ sound: !settings.sound })}
            className="flex w-full items-center justify-between rounded-md border border-white/10 bg-black/25 px-4 py-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
          >
            <span className="flex items-center gap-3">
              {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>
                <span className="block text-sm font-semibold">Звук</span>
                <span className="block text-xs text-white/45">Системные сигналы и атмосфера</span>
              </span>
            </span>
            <span className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
              {settings.sound ? "Вкл" : "Выкл"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setValue({ effects: !settings.effects })}
            className="flex w-full items-center justify-between rounded-md border border-white/10 bg-black/25 px-4 py-3 text-left transition hover:border-violet-300/40 hover:bg-violet-400/10"
          >
            <span className="flex items-center gap-3">
              <Sparkles size={18} />
              <span>
                <span className="block text-sm font-semibold">Эффекты</span>
                <span className="block text-xs text-white/45">CRT scanlines и визуальные наложения</span>
              </span>
            </span>
            <span className="rounded-md border border-violet-300/30 bg-violet-400/10 px-2 py-1 text-xs text-violet-100">
              {settings.effects ? "Вкл" : "Выкл"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
