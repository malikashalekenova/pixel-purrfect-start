import { useEffect, useState } from "react";

type IconKey = "contracts" | "messages" | "contacts" | "map";

const ICONS: { key: IconKey; label: string; glyph: string; color: string }[] = [
  { key: "contracts", label: "Контракты", glyph: "📄", color: "#d4b86a" },
  { key: "messages", label: "Сообщения", glyph: "✉", color: "#7fe7ff" },
  { key: "contacts", label: "Контакты", glyph: "☎", color: "#9be37f" },
  { key: "map", label: "Карта города", glyph: "▦", color: "#ff8a5c" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
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
      className="absolute inset-0 z-30 flex flex-col font-['Press_Start_2P'] text-[#0a1a26] animate-fade-in"
      style={{
        background:
          "linear-gradient(180deg, #1a6e8a 0%, #2d8fae 50%, #1a6e8a 100%)",
        imageRendering: "pixelated",
      }}
    >
      {/* Desktop area */}
      <div className="relative flex-1 p-6 sm:p-10">
        {/* Icons grid */}
        <div className="grid w-fit grid-cols-2 gap-6 sm:gap-8">
          {ICONS.map((ic) => {
            const isMail = ic.key === "messages";
            return (
              <button
                key={ic.key}
                onClick={isMail ? openMail : undefined}
                className="group relative flex w-24 flex-col items-center gap-2 text-center focus:outline-none sm:w-28"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center border-4 border-[#0a1016] text-2xl sm:h-20 sm:w-20 sm:text-3xl shadow-[4px_4px_0_0_#0a1016] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0_0_#0a1016] transition-transform"
                  style={{ background: ic.color }}
                >
                  <span style={{ filter: "drop-shadow(2px 2px 0 #0a1016)" }}>{ic.glyph}</span>
                </div>
                <span
                  className="px-1 py-0.5 text-[8px] leading-snug text-white sm:text-[10px]"
                  style={{ textShadow: "1px 1px 0 #000, 2px 2px 0 rgba(0,0,0,0.5)" }}
                >
                  {ic.label}
                </span>
                {isMail && notif && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] text-white border-2 border-[#0a1016] animate-pulse">
                    1
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification toast */}
        {notif && !openMessages && (
          <button
            onClick={openMail}
            className="absolute bottom-20 right-6 max-w-[280px] border-4 border-[#0a1016] bg-[#f5f1d8] p-3 text-left shadow-[6px_6px_0_0_#0a1016] animate-scale-in sm:right-10"
          >
            <div className="mb-1 flex items-center gap-2 text-[9px] text-[#0a1a26]">
              <span className="inline-block h-2 w-2 animate-pulse bg-red-500" />
              НОВОЕ СООБЩЕНИЕ
            </div>
            <div className="text-[8px] leading-relaxed text-[#0a1a26]/80">
              Неизвестный отправитель → нажмите, чтобы открыть
            </div>
          </button>
        )}

        {/* Mail window */}
        {openMessages && (
          <div className="absolute inset-0 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xl border-4 border-[#0a1016] bg-[#f5f1d8] shadow-[8px_8px_0_0_#0a1016]">
              {/* Title bar */}
              <div className="flex items-center justify-between border-b-4 border-[#0a1016] bg-[#7fe7ff] px-3 py-2">
                <span className="text-[10px] text-[#0a1a26]">СООБЩЕНИЯ.EXE</span>
                <button
                  onClick={() => setOpenMessages(false)}
                  className="flex h-5 w-5 items-center justify-center border-2 border-[#0a1016] bg-[#ff5c5c] text-[10px] text-white"
                  aria-label="Закрыть"
                >
                  X
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                <div className="mb-3 text-[9px] text-[#0a1a26]/70">
                  ОТ: ??? &nbsp; • &nbsp; {date} &nbsp; {time}
                </div>
                <div className="mb-4 border-2 border-dashed border-[#0a1016]/40" />
                <p className="text-[10px] leading-loose text-[#0a1a26] sm:text-xs">
                  «Привет. Мне сказали, что ты ищешь работу. Есть простой контракт.
                  Ничего сложного. Если интересно — приходи по адресу, который я отправил.»
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  {!read ? (
                    <button
                      onClick={() => setRead(true)}
                      className="border-4 border-[#0a1016] bg-[#9be37f] px-4 py-2 text-[10px] text-[#0a1a26] shadow-[4px_4px_0_0_#0a1016] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0a1016]"
                    >
                      ПРОЧИТАТЬ
                    </button>
                  ) : (
                    <button
                      onClick={onStartMission}
                      className="border-4 border-[#0a1016] bg-[#ff8a5c] px-4 py-2 text-[10px] text-[#0a1a26] shadow-[4px_4px_0_0_#0a1016] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0a1016] animate-pulse"
                    >
                      ПРИНЯТЬ КОНТРАКТ ▶
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="flex items-center justify-between border-t-4 border-[#0a1016] bg-[#c0c0c0] px-3 py-2">
        <div className="flex items-center gap-2 border-2 border-[#0a1016] bg-[#7fe7ff] px-2 py-1 text-[9px] text-[#0a1a26]">
          <span>▣</span> ПУСК
        </div>
        <div className="flex items-center gap-3 border-2 border-[#0a1016] bg-[#f5f1d8] px-3 py-1 text-[9px] text-[#0a1a26]">
          <span>{time}</span>
          <span className="opacity-50">|</span>
          <span>{date}</span>
        </div>
      </div>

      {/* CRT scanlines + curvature overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 2px, transparent 2px 4px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
