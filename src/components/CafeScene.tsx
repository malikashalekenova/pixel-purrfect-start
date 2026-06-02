import { useEffect, useState } from "react";
import { getVitals, modVitals } from "./VitalsHUD";

type Props = { onExit: () => void };
type Mood = "friendly" | "neutral" | "negative";

type Npc = {
  id: string;
  name: string;
  emoji: string;
  seat: string; // tailwind position classes
  intro: string;
  choices: Array<{ label: string; tone: "good" | "mid" | "bad"; reply: string; social: number }>;
};

const GUESTS: Npc[] = [
  {
    id: "mila",
    name: "Мила",
    emoji: "🐱",
    seat: "left-[14%] top-[42%]",
    intro: "Ты впервые здесь?",
    choices: [
      { label: "Да, я только пришёл", tone: "good", reply: "Тогда добро пожаловать! Тут уютно.", social: 8 },
      { label: "Просто прохожу мимо", tone: "mid", reply: "Окей… ну, наслаждайся.", social: 1 },
      { label: "Не твоё дело", tone: "bad", reply: "Грубовато. Ладно, пока.", social: -10 },
    ],
  },
  {
    id: "tomas",
    name: "Томас",
    emoji: "😼",
    seat: "right-[18%] top-[38%]",
    intro: "Слышал, система опять глючит по ночам…",
    choices: [
      { label: "Я тоже это чувствовал", tone: "good", reply: "Значит, не один я. Спасибо.", social: 6 },
      { label: "Не замечал такого", tone: "mid", reply: "Мм. Может, показалось.", social: 0 },
      { label: "Это всё бред", tone: "bad", reply: "Понял, разговор закончен.", social: -8 },
    ],
  },
  {
    id: "kira",
    name: "Кира",
    emoji: "🐈‍⬛",
    seat: "left-[44%] top-[58%]",
    intro: "У тебя усталый вид. Всё ок?",
    choices: [
      { label: "Бывает по-разному", tone: "good", reply: "Держись. Здесь можно отдохнуть.", social: 5 },
      { label: "Норм, не парься", tone: "mid", reply: "Ну ок.", social: 0 },
      { label: "Отстань", tone: "bad", reply: "…", social: -9 },
    ],
  },
];

function moodFor(social: number, rel: number): Mood {
  const score = social * 0.6 + rel;
  if (score < 30) return "negative";
  if (score < 60) return "neutral";
  return "friendly";
}
function moodIcon(m: Mood) {
  return m === "friendly" ? "💚" : m === "neutral" ? "😐" : "😾";
}
function moodRing(m: Mood) {
  return m === "friendly"
    ? "ring-emerald-300/70 bg-emerald-400/15"
    : m === "neutral"
      ? "ring-zinc-300/40 bg-zinc-300/10"
      : "ring-rose-400/70 bg-rose-500/15";
}

export function CafeScene({ onExit }: Props) {
  const [active, setActive] = useState<Npc | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [rel, setRel] = useState<Record<string, number>>({ mila: 50, tomas: 50, kira: 50 });
  const [baristaOpen, setBaristaOpen] = useState(false);
  const [baristaMsg, setBaristaMsg] = useState<string | null>(null);
  const [, force] = useState(0);

  // Refresh on vitals tick (mood depends on social)
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const v = getVitals();
  const lowSocial = v.social < 30;
  const lowStability = v.stability < 30;
  const cold = lowSocial || lowStability;

  const openNpc = (npc: Npc) => {
    if (cold && Math.random() < 0.5) {
      setBaristaMsg(`${npc.name} отворачивается — ты ему сейчас не интересен.`);
      setTimeout(() => setBaristaMsg(null), 1800);
      return;
    }
    setActive(npc);
    setReply(null);
  };

  const choose = (c: Npc["choices"][number]) => {
    if (!active) return;
    setReply(c.reply);
    modVitals({ social: c.social });
    setRel((r) => ({ ...r, [active.id]: Math.max(0, Math.min(100, r[active.id] + c.social)) }));
  };

  const orderDrink = (kind: "coffee" | "tea" | "cream") => {
    if (cold) {
      setBaristaMsg("Бариста: «Сегодня без обслуживания. Зайди, когда придёшь в себя.»");
      setTimeout(() => setBaristaMsg(null), 2200);
      return;
    }
    if (kind === "coffee") {
      modVitals({ energy: 25, stability: 5 });
      setBaristaMsg("☕ Кофе. +Энергия");
    } else if (kind === "tea") {
      modVitals({ energy: 10, stability: 15 });
      setBaristaMsg("🍵 Чай. +Стабильность");
    } else {
      modVitals({ health: 15, social: 5 });
      setBaristaMsg("🥛 Молоко со сливками. +Жизнь");
    }
    setTimeout(() => setBaristaMsg(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 animate-fade-in">
      {/* whitening intro */}
      <div className="pointer-events-none absolute inset-0 bg-white/40 animate-[cafe-enter_900ms_ease-out_forwards]" />

      <div className="relative h-[88vh] w-[min(960px,94vw)] overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-b from-[#241712] via-[#2c1c14] to-[#1a100c] shadow-[0_0_80px_rgba(251,191,36,0.25)]">
        {/* warm vignette */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_60%)]" />

        {/* header */}
        <div className="flex items-center justify-between border-b border-amber-300/20 bg-black/30 px-4 py-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200">
            ☕ Pixel Cat Cafe
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md border border-white/20 bg-black/40 px-3 py-1 text-[11px] text-white/70 hover:bg-white/10"
          >
            🚪 Выйти
          </button>
        </div>

        {/* ambient line */}
        <div className="px-4 pt-2 font-mono text-[10px] text-amber-100/60">
          *звон чашек, мягкая lo-fi музыка, тихие разговоры*
        </div>

        {/* room */}
        <div className="relative h-[calc(100%-160px)] w-full">
          {/* counter */}
          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center">
            <div className="rounded-md border border-amber-300/40 bg-amber-900/40 px-6 py-2 text-center shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              <div className="text-2xl">🧑‍🍳</div>
              <div className="font-mono text-[10px] text-amber-200">БАРИСТА</div>
            </div>
            <button
              type="button"
              onClick={() => setBaristaOpen(true)}
              className="mt-1 rounded bg-amber-400/80 px-3 py-1 text-[11px] font-bold text-[#2a1a08] hover:bg-amber-300"
            >
              Подойти к стойке
            </button>
          </div>

          {/* tables / guests */}
          {GUESTS.map((g) => {
            const m = moodFor(v.social, rel[g.id]);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => openNpc(g)}
                className={`absolute ${g.seat} flex flex-col items-center transition hover:scale-105`}
              >
                <div className={`mb-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${moodRing(m)}`}>
                  {moodIcon(m)} {Math.round(rel[g.id])}
                </div>
                <div className="rounded-md border border-amber-200/20 bg-amber-950/40 px-3 py-2 text-center">
                  <div className="text-2xl">{g.emoji}</div>
                  <div className="font-mono text-[10px] text-amber-100/80">{g.name}</div>
                </div>
                <div className="mt-1 text-[10px] text-amber-100/40">☕</div>
              </button>
            );
          })}

          {baristaMsg && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-amber-300/30 bg-black/80 px-3 py-1 text-[11px] text-amber-100 animate-fade-in">
              {baristaMsg}
            </div>
          )}
        </div>

        {/* footer hint */}
        <div className="border-t border-amber-300/20 bg-black/40 px-4 py-2 text-[10px] text-amber-100/60">
          {cold
            ? "⚠ Общение/Стабильность ниже 30% — коты холоднее, бариста может отказать."
            : "Подойди к коту, чтобы заговорить. Подними 💬 общение, помогая и слушая."}
        </div>
      </div>

      {/* NPC dialog modal */}
      {active && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="w-[min(420px,92vw)] rounded-xl border border-amber-300/40 bg-[#1b110a] p-4 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{active.emoji}</span>
              <span className="font-mono text-sm text-amber-200">{active.name}</span>
              <span className="ml-auto text-[10px] text-amber-100/50">
                отношение: {Math.round(rel[active.id])}
              </span>
            </div>

            {!reply ? (
              <>
                <p className="mb-3 text-[13px] text-amber-100/90">«{active.intro}»</p>
                <div className="space-y-1.5">
                  {active.choices.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(c)}
                      className={`w-full rounded-md px-3 py-2 text-left text-[12px] ring-1 transition hover:bg-white/5 ${
                        c.tone === "good"
                          ? "ring-emerald-400/50 text-emerald-100"
                          : c.tone === "mid"
                            ? "ring-zinc-300/30 text-zinc-100"
                            : "ring-rose-400/50 text-rose-100"
                      }`}
                    >
                      {c.tone === "good" ? "🟢" : c.tone === "mid" ? "🟡" : "🔴"} {c.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-[13px] text-amber-100/90">«{reply}»</p>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="w-full rounded-md bg-amber-400 px-3 py-2 text-[12px] font-bold text-[#1b110a] hover:bg-amber-300"
                >
                  Попрощаться
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Barista modal */}
      {baristaOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="w-[min(420px,92vw)] rounded-xl border border-amber-300/40 bg-[#1b110a] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🧑‍🍳</span>
              <span className="font-mono text-sm text-amber-200">Бариста</span>
            </div>
            <p className="mb-3 text-[13px] text-amber-100/90">
              «Что закажешь? У нас свежий кофе, ромашковый чай и молоко со сливками.»
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => orderDrink("coffee")}
                className="rounded-md border border-amber-300/40 bg-amber-900/40 px-2 py-2 text-[11px] text-amber-100 hover:bg-amber-800/50"
              >
                ☕ Кофе
                <div className="text-[9px] text-amber-200/70">+Энергия</div>
              </button>
              <button
                type="button"
                onClick={() => orderDrink("tea")}
                className="rounded-md border border-emerald-300/40 bg-emerald-900/30 px-2 py-2 text-[11px] text-emerald-100 hover:bg-emerald-800/40"
              >
                🍵 Чай
                <div className="text-[9px] text-emerald-200/70">+Стабильность</div>
              </button>
              <button
                type="button"
                onClick={() => orderDrink("cream")}
                className="rounded-md border border-rose-300/40 bg-rose-900/30 px-2 py-2 text-[11px] text-rose-100 hover:bg-rose-800/40"
              >
                🥛 Сливки
                <div className="text-[9px] text-rose-200/70">+Жизнь</div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBaristaOpen(false)}
              className="mt-3 w-full rounded-md bg-white/10 px-3 py-2 text-[12px] text-white/80 hover:bg-white/15"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cafe-enter {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
