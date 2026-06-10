import { useEffect, useMemo, useState } from "react";
import { getVitals, modVitals, type Vitals } from "./VitalsHUD";
import { CatSprite } from "./CatSprite";
import milaImg from "@/assets/mila.png";

type Props = {
  onExit: () => void;
  onGoHome: () => void;
  coins: number;
  onSpend: (amount: number) => boolean;
};

type Mood = "friendly" | "neutral" | "negative";
type Behavior = "laughing" | "alone" | "system" | "watching" | "chatting";

type Npc = {
  id: string;
  name: string;
  emoji: string;
  seat: string;
  behavior: Behavior;
  story: string;
  intro: string;
  choices: Array<{ label: string; reply: string; rel: number }>;
};

const GUESTS: Npc[] = [
  {
    id: "mila",
    name: "Мила",
    emoji: "🐱",
    seat: "left-[8%] top-[42%]",
    behavior: "chatting",
    story: "Художница. Рисует портреты котов прямо за столиком.",
    intro: "Ты впервые здесь? У тебя интересная мордочка — нарисую как-нибудь.",
    choices: [
      { label: "С удовольствием, спасибо", reply: "Договорились. Заходи почаще.", rel: 8 },
      { label: "Может быть, как-нибудь", reply: "Окей, не настаиваю.", rel: 1 },
      { label: "А что ты обычно рисуешь?", reply: "Котов, неон, пустые улицы. Всё, что молчит красиво.", rel: 5 },
      { label: "Не лезь ко мне", reply: "Поняла. Извини.", rel: -10 },
    ],
  },
  {
    id: "tomas",
    name: "Томас",
    emoji: "😼",
    seat: "right-[10%] top-[38%]",
    behavior: "system",
    story: "Старый системщик. Уверяет, что NEKO_OS «дышит» по ночам.",
    intro: "Слышал, система опять глючит по ночам… ты тоже это чувствуешь?",
    choices: [
      { label: "Да, что-то странное есть", reply: "Значит не один я. Спасибо, брат.", rel: 7 },
      { label: "Не замечал такого", reply: "Мм. Может, показалось.", rel: 0 },
      { label: "Расскажи подробнее", reply: "Гул в три ночи. И коты замолкают одновременно.", rel: 4 },
      { label: "Это бред параноика", reply: "Понял. Разговор окончен.", rel: -8 },
    ],
  },
  {
    id: "kira",
    name: "Кира",
    emoji: "🐈‍⬛",
    seat: "left-[40%] top-[62%]",
    behavior: "alone",
    story: "Тихо пьёт чай у окна. Любит смотреть на город.",
    intro: "У тебя усталый вид. Всё ок?",
    choices: [
      { label: "Бывает по-разному", reply: "Держись. Здесь можно отдохнуть.", rel: 6 },
      { label: "Норм, не парься", reply: "Ну ок.", rel: 0 },
      { label: "А ты что тут делаешь одна?", reply: "Смотрю на город. Он тише, когда на него смотришь.", rel: 4 },
      { label: "Отстань", reply: "…", rel: -9 },
    ],
  },
  {
    id: "rex",
    name: "Рекс",
    emoji: "🐯",
    seat: "right-[32%] top-[64%]",
    behavior: "laughing",
    story: "Компанейский кот. Травит байки за столиком с друзьями.",
    intro: "Ха-ха, ты бы видел его морду! А ты кто такой? Присядешь?",
    choices: [
      { label: "Давай послушаю", reply: "Вот это разговор! Свой кот.", rel: 9 },
      { label: "Может позже", reply: "Понял, заходи.", rel: 1 },
      { label: "Расскажи самую дикую историю", reply: "О-о-о, садись. Это надолго.", rel: 6 },
      { label: "Громко слишком", reply: "Эээ… ну окей.", rel: -6 },
    ],
  },
  {
    id: "noir",
    name: "Нуар",
    emoji: "🐈",
    seat: "left-[58%] top-[30%]",
    behavior: "watching",
    story: "Молчит и смотрит. Кажется, наблюдает именно за тобой.",
    intro: "…Если после кофе свернёшь к правым кварталам, держи телефон крепче. Там сегодня слишком тихо для обычной улицы.",
    choices: [
      { label: "Возможно. Мир тесен", reply: "Хороший ответ. Запомню.", rel: 5 },
      { label: "Обознался", reply: "Возможно.", rel: 0 },
      { label: "И что ты обо мне думаешь?", reply: "Что ты ещё не решил, кем хочешь быть.", rel: 3 },
      { label: "Следишь за мной?", reply: "Не льсти себе.", rel: -7 },
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

// ---------- MENU ----------
type Category = "drink" | "food" | "dessert" | "special" | "secret";

type MenuItem = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  price: number;
  cat: Category;
  // direct vital changes
  effect: Partial<Vitals>;
  // optional special effect description / flag
  flavor?: string;
  // special runtime effect kind
  kind?: "glitch-soda" | "memory-soup" | "espresso";
};

const MENU: MenuItem[] = [
  // Drinks
  { id: "milk", icon: "🥛", name: "Тёплое молоко котика", desc: "Базовое восстановление.", price: 15, cat: "drink", effect: { energy: 20, stability: 5 } },
  { id: "espresso", icon: "☕", name: "Эспрессо «System Boost»", desc: "+40% энергия, −5% стабильность. Ускоряет движение.", price: 25, cat: "drink", effect: { energy: 40, stability: -5 }, kind: "espresso", flavor: "⚡ ускорение в мини-игре" },
  { id: "tea", icon: "🍵", name: "Чай «Calm Process»", desc: "+25% стабильность. Снижает эффект глитча.", price: 20, cat: "drink", effect: { stability: 25 }, flavor: "🧠 меньше глитчей" },

  // Food
  { id: "fish-burger", icon: "🐟", name: "Рыбный бургер", desc: "+30% жизнь, +10% энергия.", price: 30, cat: "food", effect: { health: 30, energy: 10 } },
  { id: "chicken", icon: "🍗", name: "Куриные кусочки «Debug Meal»", desc: "+35% энергия.", price: 35, cat: "food", effect: { energy: 35 } },
  { id: "cheese", icon: "🧀", name: "Сырная тарелка «Neon Cheese»", desc: "+20% стабильность.", price: 40, cat: "food", effect: { stability: 20 } },

  // Desserts
  { id: "pixel-cake", icon: "🍰", name: "Пиксельный торт", desc: "+40% стабильность, +10% жизнь. Мир кажется мягче.", price: 50, cat: "dessert", effect: { stability: 40, health: 10 }, flavor: "🧠 меньше глитчей" },
  { id: "pudding", icon: "🍮", name: "Кремовый пудинг «Soft Data»", desc: "+30% ко всем датчикам (слабый универсальный бафф).", price: 45, cat: "dessert", effect: { health: 30, energy: 30, stability: 30 } },

  // Special
  { id: "glitch-soda", icon: "⚡", name: "«Glitch Soda»", desc: "+50% энергия. Случайный эффект.", price: 70, cat: "special", effect: { energy: 50 }, kind: "glitch-soda", flavor: "🎲 случайный баг" },
  { id: "memory-soup", icon: "🧠", name: "«Memory Soup»", desc: "+40% стабильность. Открывает скрытые диалоги NPC.", price: 80, cat: "special", effect: { stability: 40 }, kind: "memory-soup", flavor: "🔓 скрытые диалоги" },

  // Secret
  { id: "mafia-fish", icon: "🐟", name: "Рыба от мафии котов", desc: "+50% жизнь. Закрытое блюдо.", price: 120, cat: "secret", effect: { health: 50 }, flavor: "🐱 от мафии" },
  { id: "shadow-coffee", icon: "🖤", name: "Теневой кофе банды", desc: "+60% энергия, +20% стабильность.", price: 110, cat: "secret", effect: { energy: 60, stability: 20 }, flavor: "🐾 для своих" },
];

const CAT_TABS: Array<{ key: Category; label: string; icon: string }> = [
  { key: "drink", label: "Напитки", icon: "☕" },
  { key: "food", label: "Еда", icon: "🍔" },
  { key: "dessert", label: "Десерты", icon: "🍰" },
  { key: "special", label: "Особые", icon: "💥" },
  { key: "secret", label: "Секретное", icon: "🐾" },
];

function moodFor(rel: number): Mood {
  if (rel < 30) return "negative";
  if (rel < 60) return "neutral";
  return "friendly";
}
const moodIcon = (m: Mood) => (m === "friendly" ? "💚" : m === "neutral" ? "😐" : "😾");
const moodRing = (m: Mood) =>
  m === "friendly"
    ? "ring-emerald-300/70 bg-emerald-400/15"
    : m === "neutral"
      ? "ring-zinc-300/40 bg-zinc-300/10"
      : "ring-rose-400/70 bg-rose-500/15";
const behaviorTag = (b: Behavior) =>
  b === "laughing" ? "😂 смеётся" : b === "alone" ? "🌧 один" : b === "system" ? "🛠 о системе" : b === "watching" ? "👁 наблюдает" : "💬 болтает";

// Apply effect with 30% rule: scale down if any vital is critical
function applyEffect(effect: Partial<Vitals>, scale: number) {
  const scaled: Partial<Vitals> = {};
  (Object.keys(effect) as Array<keyof Vitals>).forEach((k) => {
    const val = effect[k];
    if (typeof val === "number") scaled[k] = Math.round(val * scale);
  });
  modVitals(scaled);
}

// Price drift below 30%: ±30%
function driftPrice(base: number, broken: boolean) {
  if (!broken) return base;
  const sign = Math.random() < 0.5 ? -1 : 1;
  return Math.max(1, Math.round(base + sign * base * (0.1 + Math.random() * 0.3)));
}

export function CafeScene({ onExit, onGoHome, coins, onSpend }: Props) {
  const [active, setActive] = useState<Npc | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [rel, setRel] = useState<Record<string, number>>(
    Object.fromEntries(GUESTS.map((g) => [g.id, 50])),
  );
  const [baristaOpen, setBaristaOpen] = useState(false);
  const [baristaMsg, setBaristaMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<Category>("drink");
  const [questDone, setQuestDone] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [memoryActive, setMemoryActive] = useState(false);
  const [coffeeReady, setCoffeeReady] = useState(false);
  const [tick, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const v = getVitals();
  const minVital = Math.min(v.health, v.energy, v.stability);
  const broken = minVital < 30; // ⚠️ Связь с правилом 30%
  const effectScale = broken ? 0.5 : 1;
  const cold = v.stability < 30;

  const canSeeSecret = secretUnlocked;

  // Stable drifted prices per render of the menu (re-roll on tick to feel alive)
  const priceTable = useMemo(() => {
    const t: Record<string, number> = {};
    for (const m of MENU) t[m.id] = driftPrice(m.price, broken);
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broken, tick]);

  const ambient = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of GUESTS) {
      const lines = AMBIENT_LINES[g.behavior];
      m[g.id] = lines[(tick + g.id.length) % lines.length];
    }
    return m;
  }, [tick]);

  const showFlash = (text: string, ms = 1900) => {
    setBaristaMsg(text);
    setTimeout(() => setBaristaMsg(null), ms);
  };

  const openNpc = (npc: Npc) => {
    if (cold && Math.random() < 0.5) {
      showFlash(`${npc.name} отворачивается — ты сейчас не интересен.`);
      return;
    }
    setActive(npc);
    setReply(null);
  };

  const choose = (c: Npc["choices"][number]) => {
    if (!active) return;
    setReply(c.reply);
    setRel((r) => ({ ...r, [active.id]: Math.max(0, Math.min(100, r[active.id] + c.rel)) }));
  };

  const buyItem = (item: MenuItem) => {
    if (cold) {
      showFlash("Бариста: «Сегодня без обслуживания. Зайди, когда придёшь в себя.»");
      return;
    }
    const price = priceTable[item.id] ?? item.price;
    if (!onSpend(price)) {
      showFlash(`Не хватает монет: нужно 🪙 ${price}`);
      return;
    }
    applyEffect(item.effect, effectScale);

    // special effects
    if (item.kind === "glitch-soda") {
      const r = Math.random();
      if (r < 0.34) {
        showFlash("⚡ Ускорение! Движение бустится.", 2200);
        modVitals({ energy: 10 });
      } else if (r < 0.67) {
        showFlash("🌀 Микро-телепорт! Реальность дёрнулась.", 2200);
        modVitals({ stability: -5 });
      } else {
        showFlash("🐛 Баг управления… немного штормит.", 2200);
        modVitals({ stability: -10 });
      }
    } else if (item.kind === "memory-soup") {
      setMemoryActive(true);
      showFlash("🧠 Память коту прояснилась. Откроются скрытые диалоги.", 2400);
    } else if (item.kind === "espresso") {
      showFlash("☕ +Энергия, бариста подмигивает. Лёгкий перегруз.");
    } else {
      const desc = broken
        ? `${item.icon} ${item.name} (эффект ослаблен −50% — система ниже 30%)`
        : `${item.icon} ${item.name}. Эффект применён.`;
      showFlash(desc, 2100);
    }

    // friendly purchases warm up relationships
    setRel((r) => {
      const next = { ...r };
      for (const k of Object.keys(next)) next[k] = Math.min(100, next[k] + 2);
      return next;
    });

    // chance to unlock secret menu after high-tier purchase
    if (!secretUnlocked && item.price >= 40) {
      if (Math.random() < 0.35) {
        setSecretUnlocked(true);
        showFlash("🐾 Бариста шепчет: «Загляни в секретное меню…»", 2600);
      }
    }
  };

  const acceptQuest = () => {
    if (cold) {
      showFlash("Бариста: «Не до квестов сейчас. Сначала приди в себя.»");
      return;
    }
    setQuestDone(true);
    modVitals({ stability: 5 });
    showFlash("📝 Квест взят: «Передай привет Нуару».", 2200);
  };

  const drinkCoffee = () => {
    if (cold) {
      showFlash("Бариста ставит кофе ближе: «Пей медленно. Система у тебя на грани.»");
    } else {
      showFlash("☕ Кофе прогрел процессор. Пора идти домой.", 2200);
    }
    modVitals({ energy: 25, stability: 10 });
    setCoffeeReady(true);
  };

  // ---------- render ----------
  const visibleItems = MENU.filter((m) => {
    if (m.cat !== tab) return false;
    if (m.cat === "secret" && !canSeeSecret) return false;
    return true;
  });
  const secretTabVisible = canSeeSecret;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 animate-fade-in">
      <div className="pointer-events-none absolute inset-0 bg-white/40 animate-[cafe-enter_900ms_ease-out_forwards]" />

      <div className="relative h-[92vh] w-[min(1000px,96vw)] overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-b from-[#241712] via-[#2c1c14] to-[#1a100c] shadow-[0_0_80px_rgba(251,191,36,0.25)]">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_60%)]" />

        {/* header */}
        <div className="flex items-center justify-between border-b border-amber-300/20 bg-black/30 px-4 py-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200">
            ☕ Pixel Cat Cafe
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-amber-100/70">
            <span>🪙 {coins}</span>
            <span>{GUESTS.length} гостей</span>
            {memoryActive && <span className="text-cyan-300">🧠 память активна</span>}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={drinkCoffee}
              className="rounded-md bg-amber-400 px-3 py-1 text-[11px] font-bold text-[#1b110a] hover:bg-amber-300"
            >
              ☕ Выпить кофе
            </button>
            {coffeeReady && (
              <button
                type="button"
                onClick={onGoHome}
                className="rounded-md bg-cyan-300 px-3 py-1 text-[11px] font-bold text-[#07101a] hover:bg-cyan-200"
              >
                Идти домой
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md border border-white/20 bg-black/40 px-3 py-1 text-[11px] text-white/70 hover:bg-white/10"
          >
            🚪 Выйти
          </button>
        </div>

        {/* room (compact) */}
        <div className="relative h-[44%] w-full overflow-hidden border-b border-amber-300/15">
          {/* windows */}
          <div className="absolute inset-x-6 top-2 flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 h-10 rounded-md border border-amber-200/20 bg-gradient-to-b from-[#0a1a2a] to-[#1a3552] shadow-[inset_0_0_15px_rgba(127,231,255,0.15)] overflow-hidden"
              >
                <div className="flex h-full items-end justify-around px-1 opacity-60">
                  <div className="h-5 w-2 bg-[#7fe7ff]/40" />
                  <div className="h-7 w-2 bg-[#a78bfa]/40" />
                  <div className="h-4 w-2 bg-[#fbbf24]/40" />
                  <div className="h-6 w-2 bg-[#7fe7ff]/40" />
                  <div className="h-8 w-2 bg-[#34d399]/40" />
                  <div className="h-3 w-2 bg-[#f472b6]/40" />
                </div>
              </div>
            ))}
          </div>

          {/* counter (barista) */}
          <div className="absolute left-1/2 top-[60px] flex -translate-x-1/2 flex-col items-center">
            <div className="rounded-md border border-amber-300/40 bg-amber-900/40 px-5 py-1.5 text-center shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              <div className="text-xl">🧑‍🍳</div>
              <div className="font-mono text-[9px] text-amber-200">БАРИСТА</div>
            </div>
            <button
              type="button"
              onClick={() => setBaristaOpen(true)}
              className="mt-1 rounded bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold text-[#2a1a08] hover:bg-amber-300"
            >
              Квесты / о кафе
            </button>
          </div>

          {/* guests */}
          {GUESTS.map((g) => {
            const m = moodFor(rel[g.id]);
            const muted = cold;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => openNpc(g)}
                className={`absolute ${g.seat} flex flex-col items-center transition hover:scale-105 ${muted ? "opacity-60" : ""}`}
              >
                <div className="mb-0.5 max-w-[110px] truncate rounded border border-amber-200/20 bg-black/60 px-1.5 py-0.5 text-[9px] text-amber-100/80">
                  {ambient[g.id]}
                </div>
                <div className={`mb-0.5 rounded-full px-1.5 py-0 text-[9px] ring-1 ${moodRing(m)}`}>
                  {moodIcon(m)} {Math.round(rel[g.id])}
                </div>
                <div className="rounded-md border border-amber-200/20 bg-amber-950/40 px-2 py-1 flex flex-col items-center">
                  <div className="animate-[cat-idle_2.4s_ease-in-out_infinite]">
                    {g.id === "mila" ? (
                      <img src={milaImg} alt="Мила" className="h-10 w-10 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]" />
                    ) : (
                      <CatSprite size="xs" variant={g.id === "tomas" ? "tomas" : g.id === "noir" ? "noir" : g.id === "rex" ? "rex" : "cream"} />
                    )}
                  </div>
                  <div className="font-mono text-[9px] text-amber-100/80 mt-0.5">{g.name}</div>
                </div>
                <div className="-mt-0.5 h-1 w-12 rounded-b bg-amber-900/70" />
                <div className="mt-0.5 text-[8px] text-amber-200/50">{behaviorTag(g.behavior)}</div>
              </button>
            );
          })}
        </div>

        {/* MENU */}
        <div className="flex h-[calc(56%-40px)] flex-col">
          <div className="border-b border-cyan-300/30 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(34,211,238,0.12),rgba(10,14,26,0.35))] px-3 py-3 shadow-[0_0_34px_rgba(34,211,238,0.18)]">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded border border-amber-300/40 bg-amber-400/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-200">
                    Бариста
                  </span>
                  <span className="hidden text-[10px] uppercase tracking-[0.2em] text-cyan-200/60 sm:inline">
                    сюжетный сигнал
                  </span>
                </div>
                <p className="font-['Press_Start_2P'] text-[12px] leading-relaxed text-amber-100 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)] animate-pulse sm:text-sm">
                  {coffeeReady
                    ? "Кофе выпит. Район ждёт за дверью."
                    : "Выглядишь выжатым. Возьми кофе перед дорогой домой."}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-cyan-100/70">
                  {coffeeReady
                    ? "Лапы снова слушаются, процессор тёплый. Теперь можно выбраться из кафе и пройти домой через ночной район."
                    : "Бариста ставит чашку ближе. Это не обычная реплика NPC — это твой следующий шаг."}
                </p>
              </div>

              <div className="grid gap-2 sm:min-w-56">
                {!coffeeReady ? (
                  <button
                    type="button"
                    onClick={drinkCoffee}
                    className="border-4 border-[#0a1016] bg-[#fbbf24] px-4 py-3 font-['Press_Start_2P'] text-[11px] text-[#1b110a] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#fde68a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
                  >
                    ☕ Выпить кофе
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGoHome}
                    className="border-4 border-[#0a1016] bg-[#7fe7ff] px-4 py-3 font-['Press_Start_2P'] text-[11px] text-[#07101a] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#a8f1ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
                  >
                    Идти домой
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-amber-300/15 bg-black/30 px-3 py-2">
            {CAT_TABS.filter((c) => c.key !== "secret" || secretTabVisible).map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setTab(c.key)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-mono transition ${
                  tab === c.key
                    ? "bg-amber-400 text-[#1b110a]"
                    : "border border-amber-300/30 text-amber-200/80 hover:bg-amber-400/10"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
            <div className="ml-auto text-[10px] text-amber-100/60">
              {broken ? "⚠ Система <30% — цены плавают, эффекты −50%" : "Меню стабильно"}
            </div>
          </div>

          <div className="grid gap-2 border-b border-amber-300/15 bg-black/20 px-3 py-2 sm:hidden">
            <button
              type="button"
              onClick={drinkCoffee}
              className="rounded-md bg-amber-400 px-3 py-2 text-[11px] font-bold text-[#1b110a] hover:bg-amber-300"
            >
              ☕ Выпить кофе
            </button>
            {coffeeReady && (
              <button
                type="button"
                onClick={onGoHome}
                className="rounded-md bg-cyan-300 px-3 py-2 text-[11px] font-bold text-[#07101a] hover:bg-cyan-200"
              >
                Идти домой
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {visibleItems.map((m) => {
                const price = priceTable[m.id] ?? m.price;
                const drifted = price !== m.price;
                const canAfford = coins >= price;
                return (
                  <div
                    key={m.id}
                    className="flex items-start gap-2 rounded-md border border-amber-300/20 bg-amber-950/30 p-2"
                  >
                    <div className="text-2xl leading-none">{m.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate font-mono text-[12px] text-amber-100">{m.name}</div>
                        <div
                          className={`font-mono text-[11px] ${
                            drifted ? "text-rose-300 animate-pulse" : "text-amber-300"
                          }`}
                          title={drifted ? `базовая цена ${m.price}` : ""}
                        >
                          🪙 {price}
                        </div>
                      </div>
                      <div className="mt-0.5 text-[10px] text-amber-100/70">{m.desc}</div>
                      {m.flavor && (
                        <div className="mt-0.5 text-[10px] text-cyan-200/80">{m.flavor}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => buyItem(m)}
                        disabled={!canAfford}
                        className={`mt-1.5 rounded px-2 py-1 text-[10px] font-bold transition ${
                          canAfford
                            ? "bg-amber-400 text-[#1b110a] hover:bg-amber-300"
                            : "cursor-not-allowed bg-white/10 text-white/40"
                        }`}
                      >
                        {canAfford ? "Заказать" : "Не хватает 🪙"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {visibleItems.length === 0 && (
                <div className="col-span-full rounded-md border border-amber-300/20 bg-black/30 p-4 text-center text-[11px] text-amber-100/60">
                  Секретное меню пока недоступно.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer hint */}
        <div className="border-t border-amber-300/20 bg-black/40 px-4 py-2 text-[10px] text-amber-100/60">
          {cold
            ? "⚠ Стабильность ниже 30% — бариста может отказать, эффекты ослаблены."
            : canSeeSecret
              ? "🐾 Секретное меню разблокировано. Мафия котов уважает."
              : "Подойди к коту, чтобы заговорить. Закажи у бариста — еда влияет на датчики."}
        </div>

        {baristaMsg && (
          <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 rounded-md border border-amber-300/30 bg-black/85 px-3 py-1 text-[11px] text-amber-100 animate-fade-in">
            {baristaMsg}
          </div>
        )}
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
                {memoryActive && (
                  <p className="mb-2 rounded border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-200">
                    🧠 *Memory Soup открывает скрытый слой мыслей этого кота…*
                  </p>
                )}
                <div className="space-y-1.5">
                  {active.choices.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(c)}
                      className="w-full rounded-md px-3 py-2 text-left text-[12px] text-amber-100 ring-1 ring-amber-200/30 transition hover:bg-white/5"
                    >
                      {c.label}
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

      {/* Barista modal (quests / info) */}
      {baristaOpen && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="w-[min(460px,92vw)] rounded-xl border border-amber-300/40 bg-[#1b110a] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🧑‍🍳</span>
              <span className="font-mono text-sm text-amber-200">Бариста</span>
              <span className="ml-auto font-mono text-[10px] text-amber-100/60">🪙 {coins}</span>
            </div>
            <p className="mb-3 text-[13px] text-amber-100/90">
              «Меню перед тобой. Если будешь много заказывать — открою секретное.»
            </p>

            <div className="rounded-md border border-amber-300/30 bg-amber-950/40 p-2 text-[11px] text-amber-100/90">
              <div className="mb-1 font-mono text-[10px] uppercase text-amber-300/80">📝 Квест бариста</div>
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

            <div className="mt-3 rounded-md border border-cyan-400/30 bg-cyan-500/10 p-2 text-[11px] text-cyan-100">
              <div className="font-mono text-[10px] uppercase text-cyan-300/80">ℹ Правило 30%</div>
              Если любой датчик ниже 30% — эффекты еды режутся вдвое, цены плавают, особые блюда могут быть недоступны.
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
