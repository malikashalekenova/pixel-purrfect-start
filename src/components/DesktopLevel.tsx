import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  onExitSystem: () => void;
  onStayInProcess: () => void;
};

type Platform = {
  id: string;
  label: string;
  glyph: string;
  accent: string;
  // position as % of play area
  x: number;
  y: number;
  // required for the quest?
  type: "file" | "profile" | "decor";
};

const PLATFORMS: Platform[] = [
  { id: "start",   label: "boot.sys",        glyph: "💾", accent: "#7fe7ff", x: 8,  y: 78, type: "decor" },
  { id: "f1",      label: "kernel.dll",      glyph: "📄", accent: "#a78bfa", x: 24, y: 62, type: "file" },
  { id: "f2",      label: "memory.cfg",      glyph: "📄", accent: "#34d399", x: 46, y: 48, type: "file" },
  { id: "f3",      label: "network.sys",     glyph: "📄", accent: "#fbbf24", x: 68, y: 34, type: "file" },
  { id: "decor1",  label: "log.txt",         glyph: "📜", accent: "#94a3b8", x: 36, y: 80, type: "decor" },
  { id: "decor2",  label: "cache.tmp",       glyph: "🗂",  accent: "#94a3b8", x: 58, y: 70, type: "decor" },
  { id: "profile", label: "user.cat.profile",glyph: "🐱", accent: "#f472b6", x: 86, y: 20, type: "profile" },
];

export function DesktopLevel({ onExitSystem, onStayInProcess }: Props) {
  // Cat starts on "start" platform
  const [currentId, setCurrentId] = useState<string>("start");
  const [openedFiles, setOpenedFiles] = useState<Set<string>>(new Set());
  const [profileActivated, setProfileActivated] = useState(false);
  const [systemMsg, setSystemMsg] = useState<string | null>(
    'Уровень 1 · «Рабочий стол запуска»\nПереходи по иконкам как по платформам.\nОткрой 3 системных файла, затем активируй "user.cat.profile".',
  );
  const [showFinal, setShowFinal] = useState(false);
  const [hopping, setHopping] = useState(false);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = useMemo(
    () => PLATFORMS.find((p) => p.id === currentId)!,
    [currentId],
  );

  const requiredCount = PLATFORMS.filter((p) => p.type === "file").length;

  function pushMessage(text: string, persistent = false) {
    setSystemMsg(text);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    if (!persistent) {
      msgTimer.current = setTimeout(() => setSystemMsg(null), 3500);
    }
  }

  function distance(a: Platform, b: Platform) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function reachable(target: Platform) {
    return distance(current, target) <= 32; // simple jump range
  }

  function handlePlatformClick(p: Platform) {
    if (p.id === currentId || hopping || showFinal) return;
    if (!reachable(p)) {
      pushMessage("Слишком далеко. Прыгни на соседнюю иконку-платформу.");
      return;
    }
    // Hop
    setHopping(true);
    setCurrentId(p.id);
    setTimeout(() => setHopping(false), 380);

    // Interactions on landing
    if (p.type === "file" && !openedFiles.has(p.id)) {
      const next = new Set(openedFiles);
      next.add(p.id);
      setOpenedFiles(next);
      pushMessage(`> open ${p.label}\n[OK] системный файл прочитан (${next.size}/${requiredCount})`);
    } else if (p.type === "profile") {
      if (openedFiles.size < requiredCount) {
        pushMessage("⛔ Сначала открой все 3 системных файла.");
      } else if (!profileActivated) {
        setProfileActivated(true);
        pushMessage(
          '> activate user.cat.profile\n[OK] Профиль пользователя котика активирован.\nСистема: «Процесс активирован. Поведение стабилизируется.»',
          true,
        );
        setTimeout(() => setShowFinal(true), 2600);
      }
    } else {
      pushMessage(`> cd ${p.label}`);
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col text-slate-100 animate-fade-in overflow-hidden"
      style={{
        background:
          "radial-gradient(900px 600px at 20% 10%, rgba(127,231,255,0.10), transparent 60%), radial-gradient(900px 600px at 90% 100%, rgba(167,139,250,0.12), transparent 60%), linear-gradient(160deg, #07091a 0%, #0b1024 60%, #07091a 100%)",
      }}
    >
      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-slate-300/80 border-b border-white/5 backdrop-blur-md bg-white/[0.02] font-['Press_Start_2P']">
        <div className="flex items-center gap-3">
          <span className="text-cyan-300">SHADOW-OS v0.1</span>
          <span className="opacity-50">·</span>
          <span>LEVEL 1: BOOT DESKTOP</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-emerald-300">FILES {openedFiles.size}/{requiredCount}</span>
          <span className={profileActivated ? "text-pink-300" : "text-slate-500"}>
            PROFILE {profileActivated ? "OK" : "—"}
          </span>
        </div>
      </div>

      {/* Play area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Pixel grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,231,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(127,231,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* CRT scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
          }}
        />

        {/* Connector lines from cat to reachable platforms */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {PLATFORMS.filter((p) => p.id !== currentId && reachable(p)).map((p) => (
            <line
              key={`line-${p.id}`}
              x1={`${current.x}%`}
              y1={`${current.y}%`}
              x2={`${p.x}%`}
              y2={`${p.y}%`}
              stroke="rgba(127,231,255,0.25)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Platforms */}
        {PLATFORMS.map((p) => {
          const isCurrent = p.id === currentId;
          const isOpened = openedFiles.has(p.id);
          const isProfileDone = p.type === "profile" && profileActivated;
          const canJump = !isCurrent && reachable(p) && !showFinal;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePlatformClick(p)}
              disabled={isCurrent || showFinal}
              className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                cursor: canJump ? "pointer" : "default",
              }}
            >
              {/* Platform base */}
              <div
                className="relative flex h-14 w-20 items-end justify-center rounded-md"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 6px 18px -8px ${p.accent}aa, 0 0 0 1px ${
                    canJump ? p.accent + "88" : "rgba(255,255,255,0.06)"
                  }`,
                  imageRendering: "pixelated",
                }}
              >
                {/* Icon */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl"
                  style={{
                    filter: `drop-shadow(0 0 6px ${p.accent}cc)`,
                    opacity: isOpened || isProfileDone ? 0.5 : 1,
                  }}
                >
                  {p.glyph}
                </div>
                <div className="mb-1 px-1 font-mono text-[9px] text-slate-200/90">
                  {p.label}
                </div>
                {(isOpened || isProfileDone) && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-slate-900 ring-2 ring-[#07091a]">
                    ✓
                  </div>
                )}
                {canJump && (
                  <div
                    className="absolute -bottom-1 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full"
                    style={{
                      background: p.accent,
                      boxShadow: `0 0 10px ${p.accent}`,
                      animation: "pulse 1.4s ease-in-out infinite",
                    }}
                  />
                )}
              </div>

              {/* Cat sprite sits on top of current platform */}
              {isCurrent && (
                <div
                  className="absolute left-1/2 -top-9 -translate-x-1/2 select-none text-[28px]"
                  style={{
                    filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.7))",
                    animation: hopping
                      ? "cat-hop 0.38s ease-out"
                      : "cat-idle 1.8s ease-in-out infinite",
                  }}
                  aria-hidden
                >
                  🐱
                </div>
              )}
            </button>
          );
        })}

        {/* System message panel */}
        {systemMsg && !showFinal && (
          <div className="absolute left-1/2 bottom-4 z-40 w-[92%] max-w-md -translate-x-1/2 animate-fade-in">
            <div
              className="rounded-lg border border-cyan-400/30 bg-black/75 px-4 py-3 font-mono text-[11px] leading-relaxed text-cyan-100 backdrop-blur whitespace-pre-line"
              style={{
                boxShadow: "0 0 24px -8px rgba(127,231,255,0.4)",
              }}
            >
              {systemMsg}
            </div>
          </div>
        )}

        {/* Final choice modal */}
        {showFinal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div
              className="w-[92%] max-w-md rounded-2xl border border-pink-400/30 p-6 text-center"
              style={{
                background:
                  "linear-gradient(160deg, rgba(20,10,30,0.95), rgba(10,8,24,0.95))",
                boxShadow: "0 30px 80px -20px rgba(244,114,182,0.4)",
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-pink-300/80">
                Система
              </p>
              <h2 className="mt-2 font-['Press_Start_2P'] text-lg text-pink-200 sm:text-xl">
                Процесс активирован
              </h2>
              <p className="mt-3 text-xs text-slate-300 sm:text-sm">
                Поведение стабилизируется. Выберите следующее действие.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onExitSystem}
                  className="font-['Press_Start_2P'] text-[11px] sm:text-xs text-[#0a1016] bg-[#7fe7ff] px-5 py-3 border-4 border-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016] hover:bg-[#a8f1ff]"
                >
                  ВЫЙТИ ИЗ СИСТЕМЫ
                </button>
                <button
                  type="button"
                  onClick={onStayInProcess}
                  className="font-['Press_Start_2P'] text-[11px] sm:text-xs text-pink-100 bg-pink-900/60 px-5 py-3 border-4 border-pink-300/60 shadow-[5px_5px_0_0_#f9a8d4] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#f9a8d4] hover:bg-pink-800/60"
                >
                  ОСТАТЬСЯ В ПРОЦЕССЕ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes cat-idle {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes cat-hop {
          0%   { transform: translateX(-50%) translateY(0) scale(1); }
          40%  { transform: translateX(-50%) translateY(-22px) scale(1.05); }
          100% { transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
