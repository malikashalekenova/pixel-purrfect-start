import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getVitals } from "./VitalsHUD";

type Frame = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Tab = "map" | "messages" | "settings";
type Dir = "up" | "down" | "left" | "right";

type Props = {
  onComplete: () => void;
};

type Cell = "road" | "wall" | "cafe";

// Dense maze generated via randomized DFS on an odd-sized grid.
// Walls are 1-cell thick — looks like the reference labyrinth.
const ROWS = 25;
const COLS = 21;

function generateMaze(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "wall" as Cell),
  );
  const stack: Array<[number, number]> = [[1, 1]];
  grid[1][1] = "road";
  const dirs: Array<[number, number]> = [
    [-2, 0], [2, 0], [0, -2], [0, 2],
  ];
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    let carved = false;
    for (const [dr, dc] of shuffled) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nc > 0 && nr < rows - 1 && nc < cols - 1 && grid[nr][nc] === "wall") {
        grid[r + dr / 2][c + dc / 2] = "road";
        grid[nr][nc] = "road";
        stack.push([nr, nc]);
        carved = true;
        break;
      }
    }
    if (!carved) stack.pop();
  }
  // Cafe at bottom-right corner
  grid[rows - 2][cols - 2] = "cafe";
  return grid;
}

const START = { r: 1, c: 1 };

export function PhoneReveal({ onComplete }: Props) {
  const [frame, setFrame] = useState<Frame>(1);
  const [tab, setTab] = useState<Tab>("map");
  const [glitch, setGlitch] = useState(false);

  const maze = useMemo(() => generateMaze(ROWS, COLS), []);
  const cellAt = useCallback(
    (r: number, c: number): Cell => {
      if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return "wall";
      return maze[r][c];
    },
    [maze],
  );

  const [pos, setPos] = useState(START);
  const [face, setFace] = useState<Dir>("up");
  const [arrived, setArrived] = useState(false);
  const [nearCafe, setNearCafe] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const lastStepRef = useRef(0);


  useEffect(() => {
    const timings: Record<Frame, number> = {
      1: 900, 2: 1000, 3: 1100, 4: 1000, 5: 900, 6: 0, 7: 0,
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
    setPos(START);
    setFace("up");
  };

  const minVital = (() => {
    const v = getVitals();
    return Math.min(v.health, v.energy, v.stability);
  })();

  const step = useCallback(
    (dir: Dir) => {
      if (frame !== 7 || arrived) return;
      const v = getVitals();
      const minV = Math.min(v.health, v.energy, v.stability, v.social);

      const now = Date.now();
      let cooldown = 120;
      if (minV < 30) cooldown = 280;
      if (minV < 15) cooldown = 520;
      if (now - lastStepRef.current < cooldown) return;

      if (minV < 15 && Math.random() < 0.35) {
        setHint("... стрелка не сработала");
        setTimeout(() => setHint(null), 700);
        return;
      }

      let actualDir = dir;
      if (minV < 30 && Math.random() < 0.18) {
        const sides: Dir[] = dir === "up" || dir === "down" ? ["left", "right"] : ["up", "down"];
        actualDir = sides[Math.floor(Math.random() * 2)];
        setHint("ой, шаг в сторону");
        setTimeout(() => setHint(null), 600);
      }

      setFace(actualDir);
      const dr = actualDir === "up" ? -1 : actualDir === "down" ? 1 : 0;
      const dc = actualDir === "left" ? -1 : actualDir === "right" ? 1 : 0;
      const nr = pos.r + dr;
      const nc = pos.c + dc;
      const target = cellAt(nr, nc);
      if (target === "wall") {
        setHint("проход закрыт");
        setTimeout(() => setHint(null), 500);
        return;
      }
      lastStepRef.current = now;
      setPos({ r: nr, c: nc });

      if (target === "cafe") {
        setArrived(true);
        setTimeout(() => onComplete(), 1400);
      }
    },
    [frame, arrived, pos, onComplete, cellAt],
  );

  useEffect(() => {
    if (frame !== 7) return;
    const around: Array<[number, number]> = [
      [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1],
    ];
    let cafe = false;
    for (const [dr, dc] of around) {
      const c = cellAt(pos.r + dr, pos.c + dc);
      if (c === "cafe") cafe = true;
    }
    setNearCafe(cafe);
  }, [pos, frame, cellAt]);

  useEffect(() => {
    if (frame !== 7) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        step(d);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frame, step]);

  const tileBg = (c: Cell) => {
    switch (c) {
      case "wall": return "#0e1a2e";
      case "cafe": return "#fbbf24";
      default: return "#f5f5f0";
    }
  };


  const unstable = minVital < 30;
  const visionRadius = unstable ? 3 : 99;
  const isVisible = (r: number, c: number) => {
    if (visionRadius >= 99) return true;
    const d = Math.abs(r - pos.r) + Math.abs(c - pos.c);
    return d <= visionRadius;
  };

  const arrowDisabledClass = minVital < 30 ? "animate-pulse" : "";

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.95)_100%)]" />

      {/* Cinematic frames */}
      {frame === 1 && (
        <div className="relative flex flex-col items-center gap-4 animate-fade-in">
          <div className="text-7xl font-mono text-cyan-300">NEKO</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-300/80">
            system pause beep
          </div>
        </div>
      )}
      {frame === 2 && (
        <div className="relative flex flex-col items-center gap-3 animate-fade-in">
          <div className="text-7xl font-mono text-cyan-300">NEKO</div>
          <div className="absolute -bottom-3 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-cyan-300/70 blur-md animate-pulse" />
          <div className="font-mono text-[10px] text-cyan-200/70">// accessing pocket.sys</div>
        </div>
      )}
      {frame === 3 && (
        <div className="relative flex flex-col items-center gap-3 animate-scale-in">
          <div className="text-6xl font-mono text-cyan-300">NEKO</div>
          <div className="h-24 w-14 rounded-md border-2 border-cyan-300 bg-[#0a1322] shadow-[0_0_30px_rgba(127,231,255,0.7)]">
            <div className="m-1 h-[calc(100%-8px)] rounded-sm bg-cyan-400/30 animate-pulse" />
          </div>
        </div>
      )}
      {frame === 4 && (
        <div className="relative flex flex-col items-center animate-scale-in">
          <div className="h-56 w-32 rounded-xl border-2 border-cyan-300 bg-[#0a1322] shadow-[0_0_60px_rgba(127,231,255,0.9)]" style={{ transform: "scale(1.15)" }}>
            <div className="m-2 h-[calc(100%-16px)] rounded-md bg-gradient-to-b from-cyan-400/30 to-violet-500/20" />
          </div>
          <div className="mt-3 font-mono text-[10px] text-cyan-300/80 animate-pulse">connecting...</div>
        </div>
      )}

      {/* Phone UI */}
      {frame >= 5 && (
        <div className="relative h-[640px] w-[320px] rounded-[28px] border-2 border-cyan-300/60 bg-[#0a1322] p-3 shadow-[0_0_60px_rgba(127,231,255,0.6)] animate-scale-in">
          <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/20" />
          <div className="mb-2 flex items-center justify-between px-2 font-mono text-[10px] text-cyan-200/80">
            <span>NEKO_OS v1.0</span>
            <span>****</span>
          </div>

          <div className="mb-2 grid grid-cols-3 gap-1 rounded-lg bg-black/40 p-1">
            {(["map", "messages", "settings"] as Tab[]).map((t) => {
              const icon = t === "map" ? "MAP" : t === "messages" ? "MSG" : "SET";
              const label = t === "map" ? "Карта" : t === "messages" ? "Чат" : "Настр.";
              const active = tab === t;
              const pulseMap = t === "map" && frame === 6;
              return (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`rounded-md px-2 py-1.5 text-[11px] transition ${
                    active ? "bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/60" : "text-white/60 hover:text-white"
                  } ${pulseMap ? "animate-pulse ring-2 ring-cyan-300" : ""}`}>
                  <div className="text-xs font-bold leading-none">{icon}</div>
                  <div>{label}</div>
                </button>
              );
            })}
          </div>

          <div className="relative h-[510px] overflow-hidden rounded-lg border border-cyan-300/20 bg-black/60 p-2">
            {tab === "map" && (
              <div className="flex h-full flex-col gap-2">
                <div className="rounded-md border border-cyan-300/40 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-100">
                  <b>добраться до кафе</b> {arrived && "[OK]"}
                </div>

                <div className={`relative flex-1 overflow-hidden rounded-md bg-[#06101c] p-1 ${unstable ? "vitals-glitch-mini" : ""}`}>
                  <div
                    className="grid h-full w-full gap-[1px]"
                    style={{
                      gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: ROWS }).map((_, r) =>
                      Array.from({ length: COLS }).map((_, c) => {
                        const cell = cellAt(r, c);
                        const isCat = pos.r === r && pos.c === c;
                        const visible = isVisible(r, c);
                        return (
                          <div
                            key={`${r}-${c}`}
                            className="relative flex items-center justify-center"
                            style={{
                              background: visible ? tileBg(cell) : "#02060c",
                              boxShadow: cell === "cafe" && visible ? "0 0 8px #fbbf24" : undefined,
                              opacity: visible ? 1 : 0.25,
                            }}
                          >
                            {visible && cell === "cafe" && <div className="h-2 w-2 rounded-sm bg-amber-400 ring-1 ring-amber-200/60" />}

                            {isCat && (
                              <div
                                className="absolute inset-0 flex items-center justify-center text-[10px] transition-transform"
                                style={{
                                  transform:
                                    face === "left" ? "scaleX(-1)" : face === "down" ? "rotate(0deg)" : undefined,
                                  filter: "drop-shadow(0 0 3px #7fe7ff)",
                                }}
                              >
                                <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 ring-1 ring-white/60" />
                              </div>
                            )}
                          </div>
                        );
                      }),
                    )}
                  </div>

                  {hint && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-0.5 text-[9px] text-cyan-200">
                      {hint}
                    </div>
                  )}
                </div>

                {frame === 6 && (
                  <button type="button" onClick={startMission}
                    className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-bold text-[#0a1322] hover:bg-cyan-300">
                    {'[>]' } ЗАПУСТИТЬ МАРШРУТ
                  </button>
                )}

                {frame === 7 && (
                  <>
                    <div className="flex gap-1">

                      {nearCafe && !arrived && (
                        <button type="button"
                          className="flex-1 rounded bg-amber-400/30 px-2 py-1 text-[10px] text-amber-100 ring-1 ring-amber-300/60 animate-pulse"
                          onClick={() => { setArrived(true); setTimeout(() => onComplete(), 1000); }}>
                          Войти
                        </button>
                      )}
                    </div>

                    <div className="mx-auto grid grid-cols-3 grid-rows-3 gap-1" style={{ width: 150 }}>
                      <div />
                      <button type="button" onClick={() => step("up")}
                        className={`rounded bg-cyan-400/20 py-2 text-xs text-cyan-100 ring-1 ring-cyan-300/40 active:bg-cyan-400/40 ${arrowDisabledClass}`}>^</button>
                      <div />
                      <button type="button" onClick={() => step("left")}
                        className={`rounded bg-cyan-400/20 py-2 text-xs text-cyan-100 ring-1 ring-cyan-300/40 active:bg-cyan-400/40 ${arrowDisabledClass}`}>{'<'}</button>
                      <div className="flex items-center justify-center text-[9px] text-white/40">{pos.r},{pos.c}</div>
                      <button type="button" onClick={() => step("right")}
                        className={`rounded bg-cyan-400/20 py-2 text-xs text-cyan-100 ring-1 ring-cyan-300/40 active:bg-cyan-400/40 ${arrowDisabledClass}`}>{'>'}</button>
                      <div />
                      <button type="button" onClick={() => step("down")}
                        className={`rounded bg-cyan-400/20 py-2 text-xs text-cyan-100 ring-1 ring-cyan-300/40 active:bg-cyan-400/40 ${arrowDisabledClass}`}>v</button>
                      <div />
                    </div>
                  </>
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
                <div className="flex justify-between rounded-md bg-white/5 p-2"><span>Звук</span><span className="text-cyan-300">ON</span></div>
                <div className="flex justify-between rounded-md bg-white/5 p-2"><span>Глитчи</span><span className="text-cyan-300">AUTO</span></div>
                <div className="flex justify-between rounded-md bg-white/5 p-2"><span>NEKO_OS</span><span className="text-white/40">v1.0</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)" }} />

      <style>{`
        @keyframes vitals-glitch-mini-kf {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(-1px,1px); }
          50% { transform: translate(1px,-1px); }
          75% { transform: translate(-1px,-1px); }
        }
        .vitals-glitch-mini { animation: vitals-glitch-mini-kf 0.25s steps(2) infinite; }
      `}</style>
    </div>
  );
}
