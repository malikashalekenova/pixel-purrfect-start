import { useState } from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";

type Stage =
  | "menu"
  | "intro"
  | "zooming"
  | "desktop"
  | "mission"
  | "workshop"
  | "done"
  | "room-after"
  | "street";

type Props = {
  stage: Stage;
  onSkipIntro: () => void;
  onSkipWorkshop: () => void;
  onJump: (stage: Stage) => void;
  onAddCoins: (n: number) => void;
  onAddXp: (n: number) => void;
};

const STAGES: Stage[] = [
  "menu",
  "intro",
  "desktop",
  "mission",
  "workshop",
  "done",
  "room-after",
  "street",
];

export function AdminPanel({
  stage,
  onSkipIntro,
  onSkipWorkshop,
  onJump,
  onAddCoins,
  onAddXp,
}: Props) {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  const handleSkipCurrent = () => {
    if (stage === "intro") return onSkipIntro();
    if (stage === "workshop") return onSkipWorkshop();
    if (stage === "mission") return onJump("workshop");
    if (stage === "done") return onJump("room-after");
    if (stage === "menu") return onJump("desktop");
    if (stage === "desktop") return onJump("workshop");
    if (stage === "room-after") return onJump("street");
  };

  return (
    <div className="fixed bottom-3 left-3 z-[120] font-mono text-[11px] text-rose-100">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-rose-600/90 px-3 py-1.5 text-white shadow-lg ring-1 ring-rose-300/50 hover:bg-rose-500"
        >
          ★ ADMIN
        </button>
      )}
      {open && (
        <div className="w-56 rounded-xl bg-black/85 p-3 ring-1 ring-rose-400/40 shadow-2xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-rose-300">★ ADMIN · {stage}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-rose-300/70 hover:text-rose-100"
              aria-label="Свернуть"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={handleSkipCurrent}
            className="mb-2 w-full rounded-md bg-rose-500/30 px-2 py-1.5 text-left text-rose-100 ring-1 ring-rose-400/40 hover:bg-rose-500/50"
          >
            ▶ Скип этапа
          </button>

          <div className="mb-1 text-[10px] uppercase tracking-wider text-rose-300/60">
            Телепорт
          </div>
          <div className="mb-2 grid grid-cols-2 gap-1">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onJump(s)}
                className={`rounded px-1.5 py-1 text-left text-[10px] ${
                  s === stage
                    ? "bg-rose-400/40 text-white ring-1 ring-rose-200"
                    : "bg-white/5 text-rose-200/80 hover:bg-rose-500/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mb-1 text-[10px] uppercase tracking-wider text-rose-300/60">
            Чит
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onAddCoins(100)}
              className="flex-1 rounded bg-amber-400/20 px-2 py-1 text-amber-200 ring-1 ring-amber-300/40 hover:bg-amber-400/30"
            >
              +100🪙
            </button>
            <button
              type="button"
              onClick={() => onAddXp(50)}
              className="flex-1 rounded bg-cyan-400/20 px-2 py-1 text-cyan-200 ring-1 ring-cyan-300/40 hover:bg-cyan-400/30"
            >
              +50 XP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
