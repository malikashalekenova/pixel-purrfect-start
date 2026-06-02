import { useEffect, useState } from "react";
import bg from "@/assets/shadow-district-bg.png";

type Props = {
  onExit: () => void;
};

export function Room({ onExit }: Props) {
  const [showThought, setShowThought] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowThought(true), 600);
    const t2 = setTimeout(() => setShowHint(true), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-black">
      {/* Room background (same dirty apartment) */}
      <img
        src={bg}
        alt="Маленькая грязная квартира главного героя"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

      {/* Thought bubble above the cat */}
      {showThought && (
        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-full animate-fade-in"
          style={{ left: "58%", top: "28%" }}
        >
          <div className="relative max-w-[260px] rounded-2xl bg-white px-4 py-3 text-[12px] leading-snug text-stone-800 shadow-2xl ring-1 ring-black/10">
            <span className="mr-1">💭</span>
            «Кажется, я засиделся дома... Может, прогуляться по улице?»
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-8 h-3 w-3 rounded-full bg-white" />
            <div className="absolute -bottom-5 left-6 h-2 w-2 rounded-full bg-white" />
          </div>
        </div>
      )}

      {/* Objective hint */}
      {showHint && (
        <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2 animate-fade-in">
          <div className="rounded-lg border border-cyan-400/30 bg-black/70 px-4 py-2 text-center text-xs text-cyan-200 backdrop-blur">
            <span className="mr-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
              Новая цель
            </span>
            <span className="font-semibold">Выйти на улицу</span>
          </div>
        </div>
      )}

      {/* Door button */}
      {showHint && (
        <button
          type="button"
          onClick={onExit}
          className="group absolute left-[10%] bottom-[22%] z-30 flex flex-col items-center animate-fade-in"
        >
          <div className="relative h-28 w-16 rounded-t-md bg-gradient-to-b from-amber-900 to-amber-950 ring-2 ring-black/60 shadow-[0_0_24px_rgba(251,191,36,0.25)] transition group-hover:shadow-[0_0_36px_rgba(251,191,36,0.55)]">
            <div className="absolute right-2 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-300" />
            <div className="absolute inset-2 rounded-sm border border-amber-700/60" />
          </div>
          <span className="mt-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200 ring-1 ring-amber-300/30">
            Выйти →
          </span>
        </button>
      )}

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  );
}
