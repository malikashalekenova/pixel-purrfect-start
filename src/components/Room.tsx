import { useEffect, useState } from "react";
import bg from "@/assets/shadow-district-bg.png";

type Props = {
  onExit: () => void;
  onRestart: () => void;
  onLoad: () => void;
};

type Phase =
  | "idle"        // initial thought + choice
  | "staying"     // chose to stay — slight darken
  | "dizzy"       // dizziness effects
  | "fainting"    // falls unconscious
  | "alone"       // camera pulls back, cat lying alone
  | "black"       // screen fully black
  | "dead";       // death message + buttons

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

  // Drive the death sequence when player chooses to stay
  useEffect(() => {
    if (phase === "idle" || phase === "dead") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (phase === "staying") {
      timers.push(setTimeout(() => setPhase("dizzy"), 2200));
    } else if (phase === "dizzy") {
      timers.push(setTimeout(() => setPhase("fainting"), 2800));
    } else if (phase === "fainting") {
      timers.push(setTimeout(() => setPhase("alone"), 2200));
    } else if (phase === "alone") {
      timers.push(setTimeout(() => setPhase("black"), 3800));
    } else if (phase === "black") {
      timers.push(setTimeout(() => setPhase("dead"), 1600));
    }
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const isDying = phase !== "idle";
  const darkness =
    phase === "staying" ? 0.35 :
    phase === "dizzy" ? 0.55 :
    phase === "fainting" ? 0.78 :
    phase === "alone" ? 0.88 :
    phase === "black" || phase === "dead" ? 1 : 0;

  const cameraScale =
    phase === "alone" ? 0.85 :
    phase === "black" || phase === "dead" ? 0.7 : 1;

  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-black">
      {/* Room background (same dirty apartment) */}
      <img
        src={bg}
        alt="Маленькая грязная квартира главного героя"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-in-out"
        style={{
          imageRendering: "pixelated",
          transform: `scale(${cameraScale})`,
          filter: phase === "dizzy" || phase === "fainting" ? "blur(2px) saturate(0.6)" : "none",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

      {/* Fallen cat silhouette during alone/black phase */}
      {(phase === "alone" || phase === "fainting") && (
        <div
          className="absolute z-30 animate-fade-in"
          style={{ left: "50%", top: "68%", transform: "translate(-50%, -50%)" }}
        >
          <div className="text-6xl opacity-90 select-none" style={{ filter: "grayscale(0.5)" }}>
            🐈‍⬛
          </div>
          <div className="mt-1 h-2 w-20 rounded-full bg-black/50 blur-sm mx-auto" />
        </div>
      )}

      {/* Dizziness swirl overlay */}
      {(phase === "dizzy" || phase === "fainting") && (
        <div
          className="pointer-events-none absolute inset-0 z-30 animate-pulse"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(120,80,180,0.25) 0%, rgba(0,0,0,0.6) 70%)",
          }}
        />
      )}

      {/* Thought bubble above the cat (initial) */}
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

      {/* Choice buttons: Exit / Stay */}
      {showHint && phase === "idle" && (
        <div className="absolute left-1/2 bottom-10 z-30 flex -translate-x-1/2 gap-4 animate-fade-in">
          <button
            type="button"
            onClick={onExit}
            className="group flex flex-col items-center"
          >
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
            onClick={() => setPhase("staying")}
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

      {/* Subtle inner thought during dying */}
      {phase === "staying" && (
        <div className="absolute left-1/2 top-10 z-30 -translate-x-1/2 animate-fade-in">
          <p className="rounded-lg bg-black/60 px-4 py-2 text-xs italic text-stone-300 backdrop-blur">
            Что-то мне нехорошо...
          </p>
        </div>
      )}
      {phase === "dizzy" && (
        <div className="absolute left-1/2 top-10 z-30 -translate-x-1/2 animate-fade-in">
          <p className="rounded-lg bg-black/60 px-4 py-2 text-xs italic text-stone-400 backdrop-blur">
            Голова кружится... в глазах темнеет...
          </p>
        </div>
      )}

      {/* Darkening veil */}
      <div
        className="pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-[1600ms]"
        style={{ opacity: darkness }}
      />

      {/* Vignette (idle only) */}
      {phase === "idle" && (
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
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
            <span className="text-amber-300">Совет:</span> необходимо поддерживать
            все показатели состояния не ниже{" "}
            <span className="font-bold text-amber-300">30%</span>. Если какой-либо
            показатель опускается ниже 30%, здоровье начинает быстро ухудшаться.
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

      {/* Hide HUD-ish chrome by covering corners during dying handled by overlay */}
      {isDying && phase !== "dead" && (
        <div className="pointer-events-none absolute inset-0 z-30" />
      )}
    </div>
  );
}
