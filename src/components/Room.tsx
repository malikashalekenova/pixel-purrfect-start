import { useEffect, useState } from "react";
import bg from "@/assets/shadow-district-bg.png";
import { CatSprite } from "@/components/CatSprite";


type Props = {
  onExit: () => void;
  onRestart: () => void;
  onLoad: () => void;
};

type Phase =
  | "idle"        // initial thought + choice
  | "standing"    // chose to stay — stands still
  | "swaying"     // light sway, losing balance
  | "stumbling"   // uneven steps, screen shake
  | "collapsing"  // legs give out, falls on side
  | "lying"       // lies motionless, camera zooms in
  | "critical"    // "Состояние критическое" message
  | "unconscious" // "Персонаж потерял сознание"
  | "black"       // full black
  | "dead";       // death screen

export function Room({ onExit, onRestart, onLoad }: Props) {
  const [showThought, setShowThought] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setShowThought(true), 600);
    const t2 = setTimeout(() => setShowHint(true), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Drive the death sequence
  useEffect(() => {
    if (phase === "idle" || phase === "dead") return;
    const seq: Record<Phase, { next: Phase; delay: number } | null> = {
      idle: null,
      standing: { next: "swaying", delay: 1800 },
      swaying: { next: "stumbling", delay: 2600 },
      stumbling: { next: "collapsing", delay: 2400 },
      collapsing: { next: "lying", delay: 1600 },
      lying: { next: "critical", delay: 2800 },
      critical: { next: "unconscious", delay: 2200 },
      unconscious: { next: "black", delay: 2000 },
      black: { next: "dead", delay: 1400 },
      dead: null,
    };
    const step = seq[phase];
    if (!step) return;
    const t = setTimeout(() => setPhase(step.next), step.delay);
    return () => clearTimeout(t);
  }, [phase]);

  const isDying = phase !== "idle";

  // Camera scale: gentle zoom-in as he lies alone
  const cameraScale =
    phase === "lying" || phase === "critical" ? 1.15 :
    phase === "unconscious" ? 1.2 :
    phase === "black" || phase === "dead" ? 1.25 :
    1;

  // Edge darkening
  const darkness =
    phase === "standing" ? 0.15 :
    phase === "swaying" ? 0.3 :
    phase === "stumbling" ? 0.45 :
    phase === "collapsing" ? 0.6 :
    phase === "lying" ? 0.7 :
    phase === "critical" ? 0.82 :
    phase === "unconscious" ? 0.92 :
    phase === "black" || phase === "dead" ? 1 : 0;

  const blur =
    phase === "swaying" ? "blur(1px)" :
    phase === "stumbling" ? "blur(2px) saturate(0.7)" :
    phase === "collapsing" || phase === "lying" ? "blur(2.5px) saturate(0.5)" :
    phase === "critical" || phase === "unconscious" ? "blur(3px) saturate(0.3)" :
    "none";

  // Cat sprite animation class per phase
  const catState =
    phase === "standing" ? "cat-standing" :
    phase === "swaying" ? "cat-swaying" :
    phase === "stumbling" ? "cat-stumbling" :
    phase === "collapsing" ? "cat-collapsing" :
    phase === "lying" || phase === "critical" || phase === "unconscious" ? "cat-lying" :
    "";

  const showCat = isDying && phase !== "black" && phase !== "dead";

  return (
    <div
      className={`absolute inset-0 z-20 overflow-hidden bg-black ${
        phase === "stumbling" ? "shake" : ""
      }`}
    >
      <style>{`
        @keyframes sway {
          0%,100% { transform: translateX(-50%) rotate(-3deg); }
          50%     { transform: translateX(-50%) rotate(3deg); }
        }
        @keyframes stumble {
          0%   { transform: translate(-50%, 0) rotate(-6deg); }
          25%  { transform: translate(-55%, -2px) rotate(4deg); }
          50%  { transform: translate(-45%, 2px) rotate(-5deg); }
          75%  { transform: translate(-52%, -1px) rotate(6deg); }
          100% { transform: translate(-50%, 0) rotate(-3deg); }
        }
        @keyframes collapse {
          0%   { transform: translate(-50%, 0) rotate(-3deg); }
          40%  { transform: translate(-50%, 8px) rotate(-10deg); }
          70%  { transform: translate(-48%, 22px) rotate(-55deg); }
          100% { transform: translate(-46%, 38px) rotate(-90deg); }
        }
        @keyframes shake {
          0%,100% { transform: translate(0,0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
        }
        .shake { animation: shake 0.25s infinite; }
        .cat-base {
          position: absolute;
          left: 50%;
          bottom: 22%;
          font-size: 56px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));
          transform: translateX(-50%);
          transition: filter 1s ease;
          user-select: none;
        }
        .cat-standing { transform: translateX(-50%) rotate(0deg); }
        .cat-swaying  { animation: sway 1.6s ease-in-out infinite; }
        .cat-stumbling{ animation: stumble 0.9s ease-in-out infinite; }
        .cat-collapsing { animation: collapse 1.5s ease-in forwards; }
        .cat-lying    { transform: translate(-46%, 38px) rotate(-90deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)) grayscale(0.6); }
      `}</style>

      {/* Room background */}
      <img
        src={bg}
        alt="Маленькая грязная квартира главного героя"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-in-out"
        style={{
          imageRendering: "pixelated",
          transform: `scale(${cameraScale})`,
          transformOrigin: "50% 70%",
          filter: blur,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

      {/* Animated cat sprite during dying sequence */}
      {showCat && (
        <div className={`cat-base ${catState}`} aria-hidden>
          🐱
          {(phase === "lying" || phase === "critical" || phase === "unconscious") && (
            <div
              className="absolute left-1/2 top-full mt-2 h-2 w-24 -translate-x-1/2 rounded-full bg-black/60 blur-md"
              style={{ transform: "translateX(-50%) rotate(90deg)" }}
            />
          )}
        </div>
      )}

      {/* Dizziness swirl */}
      {(phase === "swaying" || phase === "stumbling" || phase === "collapsing") && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(120,80,180,0.18) 0%, rgba(0,0,0,0.5) 75%)",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
      )}

      {/* Thought bubble (idle only) */}
      {showThought && phase === "idle" && (
        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-full animate-fade-in"
          style={{ left: "58%", top: "28%" }}
        >
          <div className="relative max-w-[260px] rounded-2xl bg-white px-4 py-3 text-[12px] leading-snug text-stone-800 shadow-2xl ring-1 ring-black/10">
            <span className="mr-1">💭</span>
            «Кажется, я засиделся дома... Может, прогуляться по улице?»
            <div className="absolute -bottom-2 left-8 h-3 w-3 rounded-full bg-white" />
            <div className="absolute -bottom-5 left-6 h-2 w-2 rounded-full bg-white" />
          </div>
        </div>
      )}

      {/* Objective hint */}
      {showHint && phase === "idle" && (
        <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2 animate-fade-in">
          <div className="rounded-lg border border-cyan-400/30 bg-black/70 px-4 py-2 text-center text-xs text-cyan-200 backdrop-blur">
            <span className="mr-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
              Новая цель
            </span>
            <span className="font-semibold">Выйти на улицу</span>
          </div>
        </div>
      )}

      {/* Choice buttons */}
      {showHint && phase === "idle" && (
        <div className="absolute left-1/2 bottom-10 z-30 flex -translate-x-1/2 gap-4 animate-fade-in">
          <button type="button" onClick={onExit} className="group flex flex-col items-center">
            <div className="relative h-24 w-14 rounded-t-md bg-gradient-to-b from-amber-900 to-amber-950 ring-2 ring-black/60 shadow-[0_0_24px_rgba(251,191,36,0.25)] transition group-hover:shadow-[0_0_36px_rgba(251,191,36,0.55)]">
              <div className="absolute right-2 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-300" />
              <div className="absolute inset-2 rounded-sm border border-amber-700/60" />
            </div>
            <span className="mt-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200 ring-1 ring-amber-300/30">
              Выйти →
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPhase("standing")}
            className="group flex flex-col items-center"
          >
            <div className="relative h-24 w-14 rounded-md bg-gradient-to-b from-stone-700 to-stone-900 ring-2 ring-black/60 shadow-[0_0_18px_rgba(120,120,140,0.25)] transition group-hover:shadow-[0_0_28px_rgba(160,160,200,0.45)] flex items-center justify-center text-2xl">
              🛏️
            </div>
            <span className="mt-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-stone-300 ring-1 ring-stone-400/30">
              Остаться
            </span>
          </button>
        </div>
      )}

      {/* Inner-thought captions */}
      {phase === "standing" && (
        <div className="absolute left-1/2 top-10 z-40 -translate-x-1/2 animate-fade-in">
          <p className="rounded-lg bg-black/60 px-4 py-2 text-xs italic text-stone-300 backdrop-blur">
            Что-то мне нехорошо...
          </p>
        </div>
      )}
      {phase === "swaying" && (
        <div className="absolute left-1/2 top-10 z-40 -translate-x-1/2 animate-fade-in">
          <p className="rounded-lg bg-black/60 px-4 py-2 text-xs italic text-stone-400 backdrop-blur">
            Земля плывёт под лапами...
          </p>
        </div>
      )}
      {phase === "stumbling" && (
        <div className="absolute left-1/2 top-10 z-40 -translate-x-1/2 animate-fade-in">
          <p className="rounded-lg bg-black/60 px-4 py-2 text-xs italic text-stone-400 backdrop-blur">
            Не могу удержаться на ногах...
          </p>
        </div>
      )}

      {/* Darkening veil */}
      <div
        className="pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-[1400ms]"
        style={{ opacity: darkness }}
      />

      {/* Vignette (idle only) */}
      {phase === "idle" && (
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
      )}

      {/* Mid-fade status messages */}
      {phase === "critical" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in">
          <p
            className="font-['Press_Start_2P'] text-base text-red-400 sm:text-2xl"
            style={{ textShadow: "0 0 14px rgba(248,113,113,0.5)" }}
          >
            СОСТОЯНИЕ КРИТИЧЕСКОЕ
          </p>
        </div>
      )}
      {phase === "unconscious" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in">
          <p
            className="font-['Press_Start_2P'] text-sm text-stone-300 sm:text-xl"
            style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
          >
            ПЕРСОНАЖ ПОТЕРЯЛ СОЗНАНИЕ
          </p>
        </div>
      )}

      {/* Death screen */}
      {phase === "dead" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center animate-fade-in">
          <h2
            className="font-['Press_Start_2P'] text-3xl text-red-400 sm:text-5xl"
            style={{ textShadow: "0 0 16px rgba(248,113,113,0.55), 3px 3px 0 #0a0a0a" }}
          >
            ВЫ ПОГИБЛИ
          </h2>
          <p className="mt-8 max-w-md text-sm text-stone-300 sm:text-base">
            <span className="text-amber-300">Совет:</span> все показатели должны
            быть не ниже{" "}
            <span className="font-bold text-amber-300">30%</span>. При падении
            ниже этого уровня начинается необратимое ухудшение состояния.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRestart}
              className="font-['Press_Start_2P'] text-xs sm:text-sm text-[#0a1016] bg-[#7fe7ff] px-6 py-3 border-4 border-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016] hover:bg-[#a8f1ff]"
            >
              НАЧАТЬ ЗАНОВО
            </button>
            <button
              type="button"
              onClick={onLoad}
              className="font-['Press_Start_2P'] text-xs sm:text-sm text-stone-200 bg-stone-800 px-6 py-3 border-4 border-stone-200 shadow-[5px_5px_0_0_#e7e5e4] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#e7e5e4] hover:bg-stone-700"
            >
              ЗАГРУЗИТЬ СОХРАНЕНИЕ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
