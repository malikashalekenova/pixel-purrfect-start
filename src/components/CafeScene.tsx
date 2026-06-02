import { useEffect, useMemo, useState } from "react";
import { getVitals, modVitals } from "./VitalsHUD";

type Props = { onExit: () => void };
type Mood = "friendly" | "neutral" | "negative";
type Behavior = "laughing" | "alone" | "system" | "watching" | "chatting";

type Npc = {
  id: string;
  name: string;
  emoji: string;
  seat: string; // tailwind position classes
  behavior: Behavior;
  story: string;
  intro: string;
  choices: Array<{ label: string; tone: "good" | "mid" | "bad"; reply: string; social: number }>;
};

const GUESTS: Npc[] = [
  {
    id: "mila",
    name: "Мила",
    emoji: "🐱",
    seat: "left-[10%] top-[40%]",
    behavior: "chatting",
    story: "Художница. Рисует портреты котов прямо за столиком.",
    intro: "Ты впервые здесь? У тебя интересная мордочка — нарисую как-нибудь.",
    choices: [
      { label: "С удовольствием, спасибо", tone: "good", reply: "Договорились. Заходи почаще.", social: 8 },
      { label: "Может быть, как-нибудь", tone: "mid", reply: "Окей, не настаиваю.", social: 1 },
      { label: "Не лезь ко мне", tone: "bad", reply: "Поняла. Извини.", social: -10 },
    ],
  },
  {
    id: "tomas",
    name: "Томас",
    emoji: "😼",
    seat: "right-[12%] top-[36%]",
    behavior: "system",
    story: "Старый системщик. Уверяет, что NEKO_OS «дышит» по ночам.",
    intro: "Слышал, система опять глючит по ночам… ты тоже это чувствуешь?",
    choices: [
      { label: "Да, что-то странное есть", tone: "good", reply: "Значит не один я. Спасибо, брат.", social: 7 },
      { label: "Не замечал такого", tone: "mid", reply: "Мм. Может, показалось.", social: 0 },
      { label: "Это бред параноика", tone: "bad", reply: "Понял. Разговор окончен.", social: -8 },
    ],
  },
  {
    id: "kira",
    name: "Кира",
    emoji: "🐈‍⬛",
    seat: "left-[42%] top-[60%]",
    behavior: "alone",
    story: "Тихо пьёт чай у окна. Любит смотреть на город.",
    intro: "У тебя усталый вид. Всё ок?",
    choices: [
      { label: "Бывает по-разному", tone: "good", reply: "Держись. Здесь можно отдохнуть.", social: 6 },
      { label: "Норм, не парься", tone: "mid", reply: "Ну ок.", social: 0 },
      { label: "Отстань", tone: "bad", reply: "…", social: -9 },
    ],
  },
  {
    id: "rex",
    name: "Рекс",
    emoji: "🐯",
    seat: "right-[34%] top-[62%]",
    behavior: "laughing",
    story: "Компанейский кот. Травит байки за столиком с друзьями.",
    intro: "Ха-ха, ты бы видел его морду! А ты кто такой? Присядешь?",
    choices: [
      { label: "Давай послушаю", tone: "good", reply: "Вот это разговор! Свой кот.", social: 9 },
      { label: "Может позже", tone: "mid", reply: "Понял, заходи.", social: 1 },
      { label: "Громко слишком", tone: "bad", reply: "Эээ… ну окей.", social: -6 },
    ],
  },
  {
    id: "noir",
    name: "Нуар",
    emoji: "🐈",
    seat: "left-[60%] top-[28%]",
    behavior: "watching",
    story: "Молчит и смотрит. Кажется, наблюдает именно за тобой.",
    intro: "…Я тебя уже видел. В другом районе. Любопытно.",
    choices: [
      { label: "Возможно. Мир тесен", tone: "good", reply: "Хороший ответ. Запомню.", social: 5 },
      { label: "Обознался", tone: "mid", reply: "Возможно.", social: 0 },
      { label: "Следишь за мной?", tone: "bad", reply: "Не льсти себе.", social: -7 },
    ],
  },
];

const AMBIENT_LINES: Record<Behavior, string[]> = {
  laughing: ["хахаха!", "да ладно!", "ну ты даёшь", "🤣"],
  alone: ["...", "*смотрит в окно*", "*дует на чай*"],
  system: ["…это в коде", "опять лаг", "слышишь гул?"],
  watching: ["...", "*наблюдает*", "хм."],
  chatting: ["…и тогда я говорю…", "ты понял?", "это смешно"],
};

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
function behaviorTag(b: Behavior) {
  switch (b) {
    case "laughing": return "😂 смеётся";
    case "alone": return "🌧 один";
    case "system": return "🛠 о системе";
    case "watching": return "👁 наблюдает";
    case "chatting": return "💬 болтает";
  }
}

export function CafeScene({ onExit }: Props) {
  const [active, setActive] = useState<Npc | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [rel, setRel] = useState<Record<string, number>>(
    Object.fromEntries(GUESTS.map((g) => [g.id, 50])),
  );
  const [baristaOpen, setBaristaOpen] = useState(false);
  const [baristaMsg, setBaristaMsg] = useState<string | null>(null);
  const [questDone, setQuestDone] = useState(false);
  const [tick, force] = useState(0);

  // Refresh on vitals tick + rotate ambient lines
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const v = getVitals();
  const lowSocial = v.social < 30;
  const lowStability = v.stability < 30;
  const cold = lowSocial || lowStability;

  // Pick a random ambient line per NPC, refreshed each tick
  const ambient = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of GUESTS) {
      const lines = AMBIENT_LINES[g.behavior];
      m[g.id] = lines[(tick + g.id.length) % lines.length];
    }
    return m;
  }, [tick]);

  const openNpc = (npc: Npc) => {
    if (cold && Math.random() < 0.5) {
      setBaristaMsg(`${npc.name} отворачивается — ты сейчас не интересен.`);
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

  const acceptQuest = () => {
    if (cold) {
      setBaristaMsg("Бариста: «Не до квестов сейчас. Сначала приди в себя.»");
      setTimeout(() => setBaristaMsg(null), 2000);
      return;
    }
    setQuestDone(true);
    modVitals({ social: 12, stability: 5 });
    setBaristaMsg("📝 Квест взят: «Передай привет Нуару». +Общение");
    setTimeout(() => setBaristaMsg(null), 2200);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 animate-fade-in">
      <div className="pointer-events-none absolute inset-0 bg-white/40 animate-[cafe-enter_900ms_ease-out_forwards]" />

      <div className="relative h-[90vh] w-[min(980px,95vw)] overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-b from-[#241712] via-[#2c1c14] to-[#1a100c] shadow-[0_0_80px_rgba(251,191,36,0.25)]">
        {/* warm vignette */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_60%)]" />

        {/* header */}
        <div className="flex items-center justify-between border-b border-amber-300/20 bg-black/30 px-4 py-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200">
            ☕ Pixel Cat Cafe
          </div>
          <div className="font-mono text-[10px] text-amber-100/50">
            {GUESTS.length} гостей · бариста на смене
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
          *звон чашек, мягкая lo-fi, тихие разговоры за столиками*
        </div>

        {/* room */}
        <div className="relative h-[calc(100%-170px)] w-full">
          {/* windows — city view */}
          <div className="absolute inset-x-6 top-2 flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 h-12 rounded-md border border-amber-200/20 bg-gradient-to-b from-[#0a1a2a] to-[#1a3552] shadow-[inset_0_0_15px_rgba(127,231,255,0.15)] overflow-hidden"
              >
                <div className="flex h-full items-end justify-around px-1 opacity-60">
                  <div className="h-6 w-2 bg-[#7fe7ff]/40" />
                  <div className="h-8 w-2 bg-[#a78bfa]/40" />
                  <div className="h-5 w-2 bg-[#fbbf24]/40" />
                  <div className="h-7 w-2 bg-[#7fe7ff]/40" />
                  <div className="h-9 w-2 bg-[#34d399]/40" />
                  <div className="h-4 w-2 bg-[#f472b6]/40" />
                </div>
              </div>
            ))}
          </div>

          {/* counter (barista) */}
          <div className="absolute left-1/2 top-[88px] flex -translate-x-1/2 flex-col items-center">
            <div className="rounded-md border border-amber-300/40 bg-amber-900/40 px-6 py-2 text-center shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              <div className="text-2xl">🧑‍🍳</div>
              <div className="font-mono text-[10px] text-amber-200">БАРИСТА</div>
            </div>
            <div className="mt-1 h-3 w-40 rounded-b bg-amber-950/60 border-x border-b border-amber-300/30" />
            <button
              type="button"
              onClick={() => setBaristaOpen(true)}
              className="mt-2 rounded bg-amber-400/90 px-3 py-1 text-[11px] font-bold text-[#2a1a08] hover:bg-amber-300"
            >
              Подойти к стойке
            </button>
          </div>

          {/* tables / guests */}
          {GUESTS.map((g) => {
            const m = moodFor(v.social, rel[g.id]);
            const muted = cold;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => openNpc(g)}
                className={`absolute ${g.seat} flex flex-col items-center transition hover:scale-105 ${muted ? "opacity-60" : ""}`}
              >
                {/* speech bubble */}
                <div className="mb-1 max-w-[120px] truncate rounded-md border border-amber-200/20 bg-black/60 px-2 py-0.5 text-[10px] text-amber-100/80">
                  {ambient[g.id]}
                </div>
                {/* mood */}
                <div className={`mb-1 rounded-full px-2 py-0.5 text-[10px] ring-1 ${moodRing(m)}`}>
                  {moodIcon(m)} {Math.round(rel[g.id])}
                </div>
                {/* cat at table */}
                <div className="rounded-md border border-amber-200/20 bg-amber-950/40 px-3 py-2 text-center">
                  <div className="text-2xl animate-[cat-idle_2.4s_ease-in-out_infinite]">{g.emoji}</div>
                  <div className="font-mono text-[10px] text-amber-100/80">{g.name}</div>
                </div>
                {/* table */}
                <div className="-mt-0.5 h-1.5 w-16 rounded-b bg-amber-900/70" />
                <div className="mt-0.5 text-[9px] text-amber-200/50">{behaviorTag(g.behavior)}</div>
              </button>
            );
          })}

          {baristaMsg && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-amber-300/30 bg-black/85 px-3 py-1 text-[11px] text-amber-100 animate-fade-in">
              {baristaMsg}
            </div>
          )}
        </div>

        {/* footer hint */}
        <div className="border-t border-amber-300/20 bg-black/40 px-4 py-2 text-[10px] text-amber-100/60">
          {cold
            ? "⚠ Общение/Стабильность ниже 30% — коты холоднее, бариста может отказать."
            : "Подойди к коту, чтобы заговорить. У бариста есть заказ и квест."}
        </div>
      </div>

      {/* NPC dialog modal */}
      {active && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="w-[min(440px,92vw)] rounded-xl border border-amber-300/40 bg-[#1b110a] p-4 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-2xl">{active.emoji}</span>
              <span className="font-mono text-sm text-amber-200">{active.name}</span>
              <span className="ml-auto text-[10px] text-amber-100/50">
                отношение: {Math.round(rel[active.id])}
              </span>
            </div>
            <div className="mb-2 text-[10px] italic text-amber-100/40">{active.story}</div>

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
          <div className="w-[min(440px,92vw)] rounded-xl border border-amber-300/40 bg-[#1b110a] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🧑‍🍳</span>
              <span className="font-mono text-sm text-amber-200">Бариста</span>
            </div>
            <p className="mb-3 text-[13px] text-amber-100/90">
              «Что закажешь? Свежий кофе, ромашковый чай и молоко со сливками.»
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

            {/* mini quest */}
            <div className="mt-3 rounded-md border border-amber-300/30 bg-amber-950/40 p-2 text-[11px] text-amber-100/90">
              <div className="mb-1 font-mono text-[10px] uppercase text-amber-300/80">📝 Заказ от бариста</div>
              {questDone ? (
                <div className="text-emerald-200">Квест активен: «Передай привет Нуару».</div>
              ) : (
                <>
                  <div className="mb-2">«Подойди к Нуару у окна — он давно ждёт сообщение.»</div>
                  <button
                    type="button"
                    onClick={acceptQuest}
                    className="rounded bg-amber-400 px-2 py-1 text-[11px] font-bold text-[#1b110a] hover:bg-amber-300"
                  >
                    Взять квест
                  </button>
                </>
              )}
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
        @keyframes cat-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
