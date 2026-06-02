import { useEffect, useRef, useState } from "react";

export type Vitals = {
  health: number;
  energy: number;
  stability: number;
  psyche: number;
  social: number;
};

export const FULL_VITALS: Vitals = {
  health: 100,
  energy: 100,
  stability: 100,
  psyche: 100,
  social: 100,
};

type Props = {
  location: "home" | "street";
  paused?: boolean;
  onCrash?: () => void;
};

const STATS: Array<{
  key: keyof Vitals;
  label: string;
  icon: string;
  color: string;
}> = [
  { key: "health", label: "Жизнь", icon: "❤️", color: "#ef4444" },
  { key: "energy", label: "Энергия", icon: "⚡", color: "#facc15" },
  { key: "stability", label: "Стабильность", icon: "🧠", color: "#22d3ee" },
  { key: "psyche", label: "Психика", icon: "🧩", color: "#a78bfa" },
  { key: "social", label: "Общение", icon: "💬", color: "#34d399" },
];

// Singleton store so any scene can read/modify vitals
let _vitals: Vitals = { ...FULL_VITALS };
const _listeners = new Set<(v: Vitals) => void>();

export function getVitals(): Vitals {
  return _vitals;
}
export function setVitals(patch: Partial<Vitals>) {
  _vitals = {
    health: clamp((patch.health ?? _vitals.health)),
    energy: clamp((patch.energy ?? _vitals.energy)),
    stability: clamp((patch.stability ?? _vitals.stability)),
    psyche: clamp((patch.psyche ?? _vitals.psyche)),
    social: clamp((patch.social ?? _vitals.social)),
  };
  _listeners.forEach((l) => l(_vitals));
}
export function modVitals(delta: Partial<Vitals>) {
  setVitals({
    health: _vitals.health + (delta.health ?? 0),
    energy: _vitals.energy + (delta.energy ?? 0),
    stability: _vitals.stability + (delta.stability ?? 0),
    psyche: _vitals.psyche + (delta.psyche ?? 0),
    social: _vitals.social + (delta.social ?? 0),
  });
}
function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function VitalsHUD({ location, paused, onCrash }: Props) {
  const [v, setV] = useState<Vitals>(_vitals);
  const crashedRef = useRef(false);

  useEffect(() => {
    const l = (next: Vitals) => setV({ ...next });
    _listeners.add(l);
    return () => {
      _listeners.delete(l);
    };
  }, []);

  // Tick down over time. Home = harsher, street = gentler with passive aid.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const cur = _vitals;
      const next: Vitals = { ...cur };
      (Object.keys(next) as Array<keyof Vitals>).forEach((k) => {
        const val = cur[k];
        // base decay
        let d = location === "home" ? 0.6 : 0.3;
        // accelerated decay below 30%
        if (val < 30) d *= 2.2;
        if (val < 15) d *= 1.8;
        // street offers slow recovery in normal zone
        if (location === "street" && val > 30) d -= 0.25;
        next[k] = clamp(val - d);
      });
      _vitals = next;
      _listeners.forEach((fn) => fn(next));

      const anyZero = next.health <= 0 || next.energy <= 0 || next.stability <= 0 || next.psyche <= 0;
      if (anyZero && !crashedRef.current) {
        crashedRef.current = true;
        onCrash?.();
      }
    }, 1500);
    return () => clearInterval(id);
  }, [location, paused, onCrash]);

  const minVal = Math.min(v.health, v.energy, v.stability, v.psyche, v.social);
  const danger = minVal < 30;
  const critical = minVal < 15;

  return (
    <>
      {/* Visual distortion overlays */}
      {danger && (
        <div
          className="pointer-events-none fixed inset-0 z-[55]"
          style={{
            boxShadow: `inset 0 0 ${critical ? 220 : 120}px ${critical ? 60 : 30}px rgba(239,68,68,${critical ? 0.55 : 0.3})`,
            animation: critical ? "vitals-pulse 0.6s ease-in-out infinite" : "vitals-pulse 1.4s ease-in-out infinite",
          }}
        />
      )}
      {critical && (
        <div
          className="pointer-events-none fixed inset-0 z-[55] mix-blend-screen opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,0,0,0.4) 0 2px, transparent 2px 6px)",
            animation: "vitals-glitch 0.18s steps(2) infinite",
          }}
        />
      )}

      {/* HUD panel */}
      <div className="pointer-events-none fixed left-1/2 top-3 z-[60] -translate-x-1/2">
        <div className="rounded-md border border-white/15 bg-black/70 px-3 py-2 backdrop-blur">
          <div className="flex items-center gap-3">
            {STATS.map((s) => {
              const value = v[s.key];
              const lowZone = value < 30;
              const critZone = value < 15;
              return (
                <div key={s.key} className="flex items-center gap-1.5">
                  <span className="text-xs">{s.icon}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded bg-white/10">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${value}%`,
                        background: critZone ? "#ef4444" : lowZone ? "#f59e0b" : s.color,
                        animation: critZone ? "vitals-flicker 0.3s steps(2) infinite" : undefined,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: critZone ? "#ef4444" : lowZone ? "#fbbf24" : "#e5e7eb" }}
                  >
                    {Math.round(value)}
                  </span>
                </div>
              );
            })}
          </div>
          {danger && (
            <p
              className="mt-1 text-center text-[9px] uppercase tracking-[0.2em]"
              style={{ color: critical ? "#ef4444" : "#fbbf24" }}
            >
              {critical ? "⚠ КРИТИЧЕСКАЯ ДЕГРАДАЦИЯ" : "⚠ ДЕРЖИТЕ ПОКАЗАТЕЛИ ВЫШЕ 30%"}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes vitals-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes vitals-glitch {
          0% { transform: translateX(0); }
          50% { transform: translateX(-2px); }
          100% { transform: translateX(2px); }
        }
        @keyframes vitals-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
