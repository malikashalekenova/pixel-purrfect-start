import { useEffect, useState } from "react";

type Frame = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Tab = "map" | "messages" | "settings";

type Props = {
  onComplete: () => void;
};

/**
 * Cinematic phone reveal — 7 frames, then a phone UI with map / messages / settings.
 * The map tab shows the "добраться до кафе" mission as a tiny path mini-game.
 */
export function PhoneReveal({ onComplete }: Props) {
  const [frame, setFrame] = useState<Frame>(1);
  const [tab, setTab] = useState<Tab>("map");
  const [glitch, setGlitch] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100 — mini path progress
  const [done, setDone] = useState(false);

  // Auto-advance cinematic frames 1 → 5
  useEffect(() => {
    const timings: Record<Frame, number> = {
      1: 900,   // pause + beep
      2: 1000,  // paw to pocket + glow
      3: 1100,  // phone assembled
      4: 1000,  // camera zooms
      5: 900,   // UI appears
      6: 1500,  // map highlighted (auto)
      7: 0,
    };
    if (frame >= 6) return;
    const t = setTimeout(() => {
      if (frame === 3 || frame === 4) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 220);
      }
      setFrame((f) => (f + 1) as Frame);
    }, timings[frame]);
    return () => clearTimeout(t);
  }, [frame]);

  const startMission = () => {
    setFrame(7);
    // simulate moving the mini-cat along the route
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setDone(true);
          setTimeout(() => onComplete(), 1200);
          return 100;
        }
        return p + 4;
      });
    }, 90);
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{
        filter: glitch ? "hue-rotate(80deg) contrast(1.4)" : undefined,
        transition: "filter 120ms",
      }}
    >
      {/* edge vignette / system beep visual */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.95)_100%)]" />

      {/* Frame 1 — paused world: silhouette of cat */}
      {frame === 1 && (
        <div className="relative flex flex-col items-center gap-4 animate-fade-in">
          <div className="text-7xl select-none">🐱</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-300/80">
            system • pause • beep
          </div>
        </div>
      )}

      {/* Frame 2 — paw reaches into "pocket" + glow */}
      {frame === 2 && (
        <div className="relative flex flex-col items-center gap-3 animate-fade-in">
          <div className="text-7xl">🐱</div>
          <div className="absolute -bottom-3 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-cyan-300/70 blur-md animate-pulse" />
          <div className="font-mono text-[10px] text-cyan-200/70">// accessing pocket.sys</div>
        </div>
      )}

      {/* Frame 3 — phone materializes from pixels */}
      {frame === 3 && (
        <div className="relative flex flex-col items-center gap-3 animate-scale-in">
          <div className="text-6xl">🐱</div>
          <div className="relative">
            <div className="h-24 w-14 rounded-md border-2 border-cyan-300 bg-[#0a1322] shadow-[0_0_30px_rgba(127,231,255,0.7)]">
              <div className="m-1 h-[calc(100%-8px)] rounded-sm bg-cyan-400/30 animate-pulse" />
            </div>
            {/* pixel sparkle */}
            <div className="pointer-events-none absolute -inset-3">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="absolute h-1 w-1 bg-cyan-300"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random(),
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Frame 4 — camera focuses on phone, world blurs */}
      {frame === 4 && (
        <div className="relative flex flex-col items-center animate-scale-in">
          <div
            className="h-56 w-32 rounded-xl border-2 border-cyan-300 bg-[#0a1322] shadow-[0_0_60px_rgba(127,231,255,0.9)]"
            style={{ transform: "scale(1.15)" }}
          >
            <div className="m-2 h-[calc(100%-16px)] rounded-md bg-gradient-to-b from-cyan-400/30 to-violet-500/20" />
          </div>
          <div className="mt-3 font-mono text-[10px] text-cyan-300/80 animate-pulse">
            connecting...
          </div>
        </div>
      )}

      {/* Frame 5+ — full phone UI */}
      {frame >= 5 && (
        <div className="relative h-[560px] w-[300px] rounded-[28px] border-2 border-cyan-300/60 bg-[#0a1322] p-3 shadow-[0_0_60px_rgba(127,231,255,0.6)] animate-scale-in">
          {/* notch */}
          <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/20" />
          {/* status bar */}
          <div className="mb-2 flex items-center justify-between px-2 font-mono text-[10px] text-cyan-200/80">
            <span>NEKO_OS v1.0</span>
            <span>●●●●</span>
          </div>

          {/* tabs */}
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-black/40 p-1">
            {(["map", "messages", "settings"] as Tab[]).map((t) => {
              const icon = t === "map" ? "🗺" : t === "messages" ? "💬" : "⚙";
              const label = t === "map" ? "Карта" : t === "messages" ? "Чат" : "Настр.";
              const active = tab === t;
              const pulseMap = t === "map" && frame === 6;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-md px-2 py-1.5 text-[11px] transition ${
                    active ? "bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/60" : "text-white/60 hover:text-white"
                  } ${pulseMap ? "animate-pulse ring-2 ring-cyan-300" : ""}`}
                >
                  <div className="text-lg leading-none">{icon}</div>
                  <div>{label}</div>
                </button>
              );
            })}
          </div>

          {/* screen content */}
          <div className="relative h-[420px] overflow-hidden rounded-lg border border-cyan-300/20 bg-black/60 p-3">
            {tab === "map" && (
              <div className="flex h-full flex-col gap-2">
                <div className="rounded-md border border-cyan-300/40 bg-cyan-400/10 px-2 py-1.5 text-[11px] text-cyan-100">
                  📍 Новое задание: <b>добраться до кафе</b>
                </div>

                {/* mini map */}
                <div className="relative flex-1 overflow-hidden rounded-md bg-[#06101c]">
                  {/* grid */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #1e3a5f 1px, transparent 1px), linear-gradient(to bottom, #1e3a5f 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  {/* route */}
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 280" preserveAspectRatio="none">
                    <path
                      d="M 20 240 Q 60 200 80 160 T 140 80 L 180 40"
                      stroke="#7fe7ff"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      fill="none"
                      className="animate-pulse"
                    />
                    {/* destination — cafe */}
                    <circle cx="180" cy="40" r="6" fill="#fbbf24" />
                    <text x="160" y="28" fill="#fbbf24" fontSize="10">☕ Кафе</text>
                  </svg>

                  {/* mini-cat moving along route (only after start) */}
                  {frame === 7 && (
                    <div
                      className="absolute text-sm transition-all duration-100"
                      style={{
                        left: `calc(${10 + progress * 0.8}% - 8px)`,
                        top: `calc(${85 - progress * 0.75}% - 8px)`,
                      }}
                    >
                      🐱
                    </div>
                  )}

                  {frame === 6 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-cyan-200/80 animate-pulse">
                      маршрут подсвечен
                    </div>
                  )}
                </div>

                {frame === 6 && (
                  <button
                    type="button"
                    onClick={startMission}
                    className="rounded-md bg-cyan-400 px-3 py-2 text-xs font-bold text-[#0a1322] hover:bg-cyan-300"
                  >
                    ▶ ЗАПУСТИТЬ МАРШРУТ
                  </button>
                )}

                {frame === 7 && (
                  <div className="rounded-md bg-black/60 px-2 py-1 text-center text-[11px] text-cyan-200">
                    {done ? "✅ Прибыли в кафе" : `Движение... ${progress}%`}
                  </div>
                )}
              </div>
            )}

            {tab === "messages" && (
              <div className="space-y-2 text-[12px] text-white/80">
                <div className="rounded-md bg-white/5 p-2">
                  <div className="text-cyan-300">Пушок:</div>
                  <div>Загляни в кафе на углу — там сегодня людно.</div>
                </div>
                <div className="rounded-md bg-white/5 p-2 text-white/50">
                  <div>Система:</div>
                  <div>Новое задание добавлено на карту.</div>
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-2 text-[12px] text-white/80">
                <div className="flex justify-between rounded-md bg-white/5 p-2">
                  <span>Звук</span><span className="text-cyan-300">ON</span>
                </div>
                <div className="flex justify-between rounded-md bg-white/5 p-2">
                  <span>Глитчи</span><span className="text-cyan-300">AUTO</span>
                </div>
                <div className="flex justify-between rounded-md bg-white/5 p-2">
                  <span>NEKO_OS</span><span className="text-white/40">v1.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanlines for CRT feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
        }}
      />
    </div>
  );
}
