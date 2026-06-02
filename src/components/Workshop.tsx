import { useRef, useState } from "react";
import { toast } from "sonner";

type Color = "red" | "blue" | "yellow" | "green";

const COLORS: Record<Color, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
  green: "#22c55e",
};

const LEFT_ORDER: Color[] = ["red", "blue", "yellow", "green"];
const RIGHT_ORDER: Color[] = ["yellow", "green", "red", "blue"];

const W = 480;
const H = 360;
const PAD_X = 60;
const LEFT_X = PAD_X;
const RIGHT_X = W - PAD_X;
const STEP_Y = 70;
const TOP_Y = 50;

const leftY = (i: number) => TOP_Y + i * STEP_Y;
const rightY = (i: number) => TOP_Y + i * STEP_Y;

export function Workshop({ onComplete }: { onComplete: () => void }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [connections, setConnections] = useState<Partial<Record<Color, number>>>({});
  // dragging from left index i
  const [drag, setDrag] = useState<{ from: number; x: number; y: number } | null>(null);
  const [done, setDone] = useState(false);

  const allDone = LEFT_ORDER.every((c) => connections[c] !== undefined);

  const svgPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    return { x, y };
  };

  const onPointerDownLeft = (i: number, e: React.PointerEvent) => {
    e.preventDefault();
    const color = LEFT_ORDER[i];
    // remove existing connection from this left
    const next = { ...connections };
    delete next[color];
    setConnections(next);
    const p = svgPoint(e);
    setDrag({ from: i, x: p.x, y: p.y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = svgPoint(e);
    setDrag({ ...drag, x: p.x, y: p.y });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = svgPoint(e);
    // find right index close to pointer
    let hit = -1;
    for (let i = 0; i < RIGHT_ORDER.length; i++) {
      const dx = p.x - RIGHT_X;
      const dy = p.y - rightY(i);
      if (Math.hypot(dx, dy) < 28) {
        hit = i;
        break;
      }
    }
    const fromColor = LEFT_ORDER[drag.from];
    if (hit !== -1 && RIGHT_ORDER[hit] === fromColor) {
      // ensure right side not already used by another color
      const usedRightIdx = Object.values(connections);
      if (!usedRightIdx.includes(hit)) {
        const next = { ...connections, [fromColor]: hit };
        setConnections(next);
        if (LEFT_ORDER.every((c) => next[c] !== undefined)) {
          setDone(true);
          setTimeout(() => {
            toast.success("Терминал настроен", {
              description: "+50 монет · +опыт · новые контракты разблокированы",
            });
            setTimeout(onComplete, 1600);
          }, 400);
        }
      }
    }
    setDrag(null);
  };

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto"
      style={{
        background:
          "radial-gradient(900px 600px at 50% 30%, rgba(127,231,255,0.10), transparent 60%), linear-gradient(160deg, #0a0e1a 0%, #0f1424 60%, #0a0e1a 100%)",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Inter, sans-serif",
      }}
    >
      {/* Header / NPC dialog */}
      <div className="mb-4 w-full max-w-xl">
        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
          Контракт · Мастерская
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
          Настрой терминал
        </h2>
        <div
          className="mt-3 flex items-start gap-3 rounded-2xl p-3 text-sm text-slate-200"
          style={{
            background: "linear-gradient(160deg, rgba(20,24,40,0.85), rgba(10,14,26,0.85))",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{
              background: "linear-gradient(145deg,#a78bfa,#7c3aed)",
              boxShadow: "0 0 14px rgba(167,139,250,0.5)",
            }}
          >
            🐱
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-medium text-violet-300">NPC · Механик</div>
            <p className="mt-0.5 text-[13px] leading-relaxed">
              «Привет. Этот терминал перестал работать. Соедини провода одного цвета — и всё заработает.»
            </p>
          </div>
        </div>
      </div>

      {/* Terminal panel */}
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(160deg, rgba(18,22,38,0.95), rgba(8,12,22,0.95))",
          boxShadow:
            "0 30px 80px -20px rgba(127,231,255,0.25), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            terminal.exe
          </div>
          <div className="text-[10px] text-slate-500">
            {Object.keys(connections).length}/4
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full touch-none select-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={() => setDrag(null)}
          >
            {/* board */}
            <rect
              x="20"
              y="20"
              width={W - 40}
              height={H - 40}
              rx="16"
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.08)"
            />

            {/* completed/active wire paths */}
            {LEFT_ORDER.map((color, i) => {
              const ri = connections[color];
              if (ri === undefined) return null;
              const x1 = LEFT_X;
              const y1 = leftY(i);
              const x2 = RIGHT_X;
              const y2 = rightY(ri);
              const c = (x1 + x2) / 2;
              return (
                <path
                  key={`wire-${color}`}
                  d={`M ${x1} ${y1} C ${c} ${y1}, ${c} ${y2}, ${x2} ${y2}`}
                  stroke={COLORS[color]}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${COLORS[color]}cc)` }}
                />
              );
            })}

            {/* drag preview */}
            {drag && (() => {
              const color = LEFT_ORDER[drag.from];
              const x1 = LEFT_X;
              const y1 = leftY(drag.from);
              const c = (x1 + drag.x) / 2;
              return (
                <path
                  d={`M ${x1} ${y1} C ${c} ${y1}, ${c} ${drag.y}, ${drag.x} ${drag.y}`}
                  stroke={COLORS[color]}
                  strokeWidth={5}
                  strokeDasharray="6 6"
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.85}
                />
              );
            })()}

            {/* Left ports */}
            {LEFT_ORDER.map((color, i) => (
              <g
                key={`L-${i}`}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => onPointerDownLeft(i, e)}
              >
                <rect
                  x={LEFT_X - 50}
                  y={leftY(i) - 16}
                  width={50}
                  height={32}
                  rx={6}
                  fill="rgba(255,255,255,0.05)"
                  stroke="rgba(255,255,255,0.1)"
                />
                <circle
                  cx={LEFT_X}
                  cy={leftY(i)}
                  r={14}
                  fill={COLORS[color]}
                  style={{ filter: `drop-shadow(0 0 8px ${COLORS[color]}cc)` }}
                />
                <circle
                  cx={LEFT_X}
                  cy={leftY(i)}
                  r={5}
                  fill="rgba(0,0,0,0.4)"
                />
              </g>
            ))}

            {/* Right ports */}
            {RIGHT_ORDER.map((color, i) => {
              const used = Object.values(connections).includes(i);
              return (
                <g key={`R-${i}`}>
                  <rect
                    x={RIGHT_X}
                    y={rightY(i) - 16}
                    width={50}
                    height={32}
                    rx={6}
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <circle
                    cx={RIGHT_X}
                    cy={rightY(i)}
                    r={14}
                    fill={COLORS[color]}
                    opacity={used ? 1 : 0.85}
                    style={{ filter: `drop-shadow(0 0 8px ${COLORS[color]}aa)` }}
                  />
                  <circle
                    cx={RIGHT_X}
                    cy={rightY(i)}
                    r={5}
                    fill="rgba(0,0,0,0.4)"
                  />
                </g>
              );
            })}
          </svg>

          {done && (
            <div
              className="mt-3 rounded-xl p-3 text-center text-sm font-semibold text-emerald-300 animate-scale-in"
              style={{
                background: "rgba(34,197,94,0.08)",
                boxShadow: "0 0 0 1px rgba(34,197,94,0.25), 0 0 24px -8px rgba(34,197,94,0.6)",
              }}
            >
              ✓ Терминал настроен
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Зажми левый порт и проведи провод к правому того же цвета
          </p>
        </div>
      </div>

      {/* Reward chip */}
      <div className="mt-4 flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-300 ring-1 ring-white/10">
        <span>🪙</span>
        <span className="text-amber-300 font-semibold">50</span>
        <span className="opacity-60">награда за контракт</span>
      </div>
    </div>
  );
}
