import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import bg from "@/assets/shadow-district-bg.png";
import { Desktop } from "@/components/Desktop";
import { Workshop } from "@/components/Workshop";
import { Street } from "@/components/Street";
import { Leaderboard } from "@/components/Leaderboard";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shadow District" },
      { name: "description", content: "Shadow District — a pixel art story game about chasing success from a tiny dirty room in the slums." },
      { property: "og:title", content: "Shadow District" },
      { property: "og:description", content: "A pixel art story game. Start your journey from the shadows." },
    ],
  }),
  component: Index,
});

type Stage = "menu" | "zooming" | "desktop" | "mission" | "workshop" | "done" | "street";

function Index() {
  const [stage, setStage] = useState<Stage>("menu");
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const handlePlay = () => {
    setStage("zooming");
    setTimeout(() => setStage("desktop"), 2200);
  };

  const handleStartMission = () => {
    setStage("mission");
    toast("Контракт принят. Направляйся в мастерскую.", {
      description: "Соседняя улица · NPC-механик ждёт.",
    });
    setTimeout(() => setStage("workshop"), 2200);
  };

  const handleWorkshopComplete = () => {
    setCoins((c) => c + 50);
    setXp((x) => x + 25);
    setStage("done");
    toast("Контракт выполнен!", {
      description: "Выходим на улицу...",
    });
    setTimeout(() => setStage("street"), 1800);
  };

  const handleCommunicate = (xpGain: number) => {
    setXp((x) => x + xpGain);
  };

  const handleDiscoverCafe = () => {
    // marker added to city map (future feature)
  };

  // Monitor approximate center in the background image (percent of image)
  // From the generated bg: monitor sits ~58% from left, ~46% from top.
  const monitorOrigin = "58% 46%";
  const zoomScale = stage === "menu" ? 1 : 8;

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* Background that zooms into the monitor */}
      <img
        src={bg}
        alt="Pixel art cat in hoodie sitting at an old computer in a dirty apartment"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-in-out"
        style={{
          imageRendering: "pixelated",
          transformOrigin: monitorOrigin,
          transform: `scale(${zoomScale})`,
        }}
      />

      {/* Vignette only in menu */}
      {stage === "menu" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
        </>
      )}

      {/* Fade-to-black during zoom transition */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: stage === "zooming" ? 0.85 : 0, transitionDelay: stage === "zooming" ? "1200ms" : "0ms" }}
      />

      {/* Title + Play button (menu only) */}
      {stage === "menu" && (
        <>
          <div className="relative z-10 flex w-full flex-col items-center px-6 pt-10 sm:pt-16">
            <h1
              className="text-center font-['Press_Start_2P'] text-4xl leading-tight tracking-tight text-[#7fe7ff] sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                textShadow:
                  "0 0 12px rgba(127,231,255,0.55), 4px 4px 0 #0a1a26, 8px 8px 0 rgba(0,0,0,0.6)",
              }}
            >
              SHADOW
              <br />
              DISTRICT
            </h1>
          </div>

          <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 sm:bottom-24">
            <button
              type="button"
              onClick={handlePlay}
              className="font-['Press_Start_2P'] text-xl sm:text-2xl text-[#0a1016] bg-[#7fe7ff] px-10 py-5 border-4 border-[#0a1016] shadow-[6px_6px_0_0_#0a1016] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_0_#0a1016] hover:bg-[#a8f1ff]"
            >
              ИГРАТЬ
            </button>
          </div>
        </>
      )}

      {/* Desktop OS appears after zoom */}
      {(stage === "desktop" || stage === "mission" || stage === "done") && (
        <Desktop onStartMission={handleStartMission} />
      )}

      {/* Mission travel overlay */}
      {stage === "mission" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 animate-fade-in">
          <div className="max-w-md px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
              Глава 1 · В пути
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Мастерская на соседней улице
            </h2>
            <p className="mt-4 text-sm text-white/60">
              Загрузка локации...
            </p>
          </div>
        </div>
      )}

      {/* Workshop minigame */}
      {stage === "workshop" && (
        <Workshop onComplete={handleWorkshopComplete} />
      )}

      {/* Street scene after first contract */}
      {stage === "street" && (
        <Street
          onCommunicate={handleCommunicate}
          onDiscoverCafe={handleDiscoverCafe}
        />
      )}

      {/* HUD: coins / xp */}
      {(stage === "desktop" || stage === "mission" || stage === "workshop" || stage === "done" || stage === "street") && (
        <div className="pointer-events-none absolute right-3 top-3 z-[60] flex items-center gap-2 text-xs">
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-amber-300 ring-1 ring-white/10 backdrop-blur">
            🪙 {coins}
          </span>
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-cyan-300 ring-1 ring-white/10 backdrop-blur">
            ✦ {xp} XP
          </span>
        </div>
      )}

      {/* Leaderboard trigger — always available */}
      <button
        type="button"
        onClick={() => setLeaderboardOpen(true)}
        className="absolute left-3 top-3 z-[60] rounded-full bg-black/60 px-3 py-1.5 text-xs text-cyan-200 ring-1 ring-cyan-400/30 backdrop-blur hover:bg-cyan-400/10 hover:text-cyan-100 transition"
      >
        🏆 Рейтинг
      </button>

      <Leaderboard open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />

      {/* Global CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-15 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
        }}
      />
    </main>
  );
}
