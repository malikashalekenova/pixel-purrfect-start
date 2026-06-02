import { useEffect, useState } from "react";

type IconKey =
  | "contracts"
  | "messages"
  | "map"
  | "shop"
  | "leaderboard"
  | "profile"
  | "bank"
  | "settings";

const ICONS: { key: IconKey; label: string; glyph: string; accent: string }[] = [
  { key: "contracts", label: "Контракты", glyph: "📋", accent: "#7fe7ff" },
  { key: "messages", label: "Сообщения", glyph: "✉", accent: "#a78bfa" },
  { key: "shop", label: "Магазин", glyph: "🛒", accent: "#34d399" },
  { key: "leaderboard", label: "Рейтинг", glyph: "🏆", accent: "#fbbf24" },
  { key: "profile", label: "Профиль", glyph: "👤", accent: "#f472b6" },
  { key: "map", label: "Карта города", glyph: "🗺", accent: "#22d3ee" },
  { key: "bank", label: "Банк", glyph: "💳", accent: "#60a5fa" },
  { key: "settings", label: "Настройки", glyph: "⚙", accent: "#94a3b8" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  return { time, date };
}

export function Desktop({ onStartMission }: { onStartMission: () => void }) {
  const { time, date } = useClock();
  const [notif, setNotif] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [read, setRead] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNotif(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const openMail = () => {
    setOpenMessages(true);
    setNotif(false);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col text-slate-100 animate-fade-in overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 800px at 20% 10%, rgba(127,231,255,0.10), transparent 60%), radial-gradient(1000px 700px at 90% 100%, rgba(167,139,250,0.12), transparent 60%), linear-gradient(160deg, #0a0e1a 0%, #0f1424 60%, #0a0e1a 100%)",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Inter, sans-serif",
      }}
    >
      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-300/80 border-b border-white/5 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Online
          </span>
          <span className="opacity-50">•</span>
          <span>ShadowNet v3.2</span>
        </div>
        <div className="flex items-center gap-4">
          <span>⚡ 86%</span>
          <span>📶</span>
          <span>🔊</span>
        </div>
      </div>

      {/* Desktop area */}
      <div className="relative flex-1 p-6 sm:p-10">
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Icon grid */}
        <div className="relative grid w-fit grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-7">
          {ICONS.map((ic) => {
            const isMail = ic.key === "messages";
            return (
              <button
                key={ic.key}
                onClick={isMail ? openMail : undefined}
                className="group relative flex w-20 flex-col items-center gap-2 rounded-xl p-2 text-center transition-all hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 sm:w-24"
              >
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white sm:h-16 sm:w-16 sm:text-[28px] transition-transform group-hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(155deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                    boxShadow:
                      `inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px -10px ${ic.accent}80, 0 0 0 1px rgba(255,255,255,0.06)`,
                  }}
                >
                  <span
                    style={{
                      filter: `drop-shadow(0 0 6px ${ic.accent}aa)`,
                    }}
                  >
                    {ic.glyph}
                  </span>
                  {isMail && notif && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow-[0_0_10px_#f43f5e] ring-2 ring-[#0a0e1a] animate-pulse">
                      1
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight text-slate-200/90 sm:text-xs">
                  {ic.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notification toast */}
        {notif && !openMessages && (
          <button
            onClick={openMail}
            className="absolute bottom-24 right-4 w-[300px] overflow-hidden rounded-2xl text-left animate-scale-in sm:right-8"
            style={{
              background:
                "linear-gradient(160deg, rgba(20,24,40,0.9), rgba(10,14,26,0.9))",
              boxShadow:
                "0 20px 50px -20px rgba(167,139,250,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-start gap-3 p-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{
                  background: "linear-gradient(145deg, #a78bfa, #7c3aed)",
                  boxShadow: "0 0 14px rgba(167,139,250,0.6)",
                }}
              >
                ✉
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-violet-300">
                    Сообщения
                  </span>
                  <span className="text-[10px] text-slate-400">сейчас</span>
                </div>
                <div className="mt-0.5 text-sm font-semibold text-white">
                  Новое сообщение
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  ??? · нажмите, чтобы открыть
                </div>
              </div>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 opacity-70" />
          </button>
        )}

        {/* Message window */}
        {openMessages && (
          <div className="absolute inset-0 flex items-center justify-center p-4 animate-fade-in">
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl"
              style={{
                background:
                  "linear-gradient(160deg, rgba(18,22,38,0.95), rgba(10,14,26,0.95))",
                boxShadow:
                  "0 30px 80px -20px rgba(127,231,255,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Title bar */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-xs text-slate-400">Сообщения</span>
                </div>
                <button
                  onClick={() => setOpenMessages(false)}
                  className="rounded-md px-2 py-0.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                  aria-label="Закрыть"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{
                      background:
                        "linear-gradient(145deg, #475569, #1e293b)",
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    ?
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Неизвестный отправитель
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {date} · {time}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-white/[0.04] p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-white/5">
                  «Привет. Мне сказали, что ты ищешь работу. Есть простой
                  контракт. Ничего сложного. Если интересно — приходи по
                  адресу, который я отправил.»
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setOpenMessages(false)}
                    className="rounded-lg px-4 py-2 text-xs text-slate-300 hover:bg-white/5"
                  >
                    Позже
                  </button>
                  {!read ? (
                    <button
                      onClick={() => setRead(true)}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-900 transition-transform hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(145deg, #7fe7ff, #38bdf8)",
                        boxShadow:
                          "0 10px 24px -10px rgba(127,231,255,0.7)",
                      }}
                    >
                      Прочитать
                    </button>
                  ) : (
                    <button
                      onClick={onStartMission}
                      className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-900 transition-transform hover:-translate-y-0.5 animate-pulse"
                      style={{
                        background:
                          "linear-gradient(145deg, #a78bfa, #c084fc)",
                        boxShadow:
                          "0 10px 24px -10px rgba(167,139,250,0.8)",
                      }}
                    >
                      Принять контракт →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dock / taskbar */}
      <div className="pb-4">
        <div
          className="mx-auto flex w-fit items-center gap-1 rounded-2xl px-2 py-1.5"
          style={{
            background: "rgba(255,255,255,0.04)",
            boxShadow:
              "0 -10px 30px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.06)",
            backdropFilter: "blur(14px)",
          }}
        >
          {ICONS.slice(0, 6).map((ic) => (
            <button
              key={`dock-${ic.key}`}
              onClick={ic.key === "messages" ? openMail : undefined}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-transform hover:-translate-y-1"
              style={{
                background:
                  "linear-gradient(155deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
              }}
              title={ic.label}
            >
              <span style={{ filter: `drop-shadow(0 0 6px ${ic.accent}aa)` }}>
                {ic.glyph}
              </span>
            </button>
          ))}
          <div className="mx-1 h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-3 text-[11px] text-slate-300">
            <div className="text-right leading-tight">
              <div className="font-semibold text-white">{time}</div>
              <div className="text-[10px] text-slate-400">{date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
