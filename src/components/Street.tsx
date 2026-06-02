import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  onCommunicate: (delta: number) => void;
  onDiscoverCafe: () => void;
};

type DialogChoice = {
  id: 1 | 2 | 3 | 4;
  label: string;
  reply: string;
  rel: number;
  xp: number;
  comm: number;
};

type NpcId = "pushok" | "ryzhik";

const PUSHOK_INTRO =
  "Ой! Привет! Я тебя раньше здесь не видел. Ты недавно сюда переехал?";

const PUSHOK_CHOICES: DialogChoice[] = [
  {
    id: 1,
    label: "😊 Да, совсем недавно.",
    reply: "Здорово! Добро пожаловать! Если что-то понадобится, можешь спрашивать.",
    rel: 2,
    xp: 8,
    comm: 12,
  },
  {
    id: 2,
    label: "😺 Ага. Пока привыкаю к району.",
    reply: "Понимаю. Тут очень уютно, когда привыкнешь.",
    rel: 1,
    xp: 6,
    comm: 10,
  },
  {
    id: 3,
    label: "🤔 Может быть. А ты кто?",
    reply: "Я Пушок! Живу тут неподалёку и люблю знакомиться с соседями!",
    rel: 1,
    xp: 5,
    comm: 8,
  },
  {
    id: 4,
    label: "😶 Извини, мне пора.",
    reply: "Ой, хорошо! Хорошего дня тогда!",
    rel: 0,
    xp: 1,
    comm: 5,
  },
];

const RYZHIK_INTRO =
  "Привет. Ты новенький в этом районе, да? Я раньше тебя здесь не видел.";

const RYZHIK_CHOICES: DialogChoice[] = [
  {
    id: 1,
    label: "Да, недавно переехал.",
    reply:
      "Понятно. Тогда советую быть осторожнее. В этом районе не все такие дружелюбные, как я.",
    rel: 1,
    xp: 10,
    comm: 25,
  },
  {
    id: 2,
    label: "А тебе какое дело?",
    reply: "Ладно-ладно, просто хотел познакомиться.",
    rel: -1,
    xp: 2,
    comm: 10,
  },
  {
    id: 3,
    label: "Может быть. А что?",
    reply: "Ничего особенного. Просто люблю знать соседей.",
    rel: 0,
    xp: 5,
    comm: 18,
  },
  {
    id: 4,
    label: "Извини, я спешу.",
    reply: "Ну хорошо, удачи тогда.",
    rel: 0,
    xp: 1,
    comm: 5,
  },
];


export function Street({ onCommunicate, onDiscoverCafe }: Props) {
  // Needs bars
  const [thirst, setThirst] = useState(82);
  const [hunger, setHunger] = useState(78);
  const [social, setSocial] = useState(70);
  const [lonely, setLonely] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [relation, setRelation] = useState(0);
  const [met, setMet] = useState(false);

  // Stats appear gradually
  useEffect(() => {
    const id = setInterval(() => {
      setThirst((v) => Math.max(0, v - 0.6));
      setHunger((v) => Math.max(0, v - 0.45));
      setSocial((v) => Math.max(0, v - 0.8));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (social < 25 && !lonely) {
      setLonely(true);
      toast("Ты чувствуешь одиночество...", {
        description: "−5 к настроению. Поговори с кем-нибудь.",
      });
    } else if (social > 40 && lonely) {
      setLonely(false);
    }
  }, [social, lonely]);

  const openDialog = () => {
    setDialogOpen(true);
    setReply(null);
  };

  const choose = (c: DialogChoice) => {
    setReply(c.reply);
    setRelation((r) => r + c.rel);
    setSocial((s) => Math.min(100, s + c.comm));
    onCommunicate(c.xp);
    if (!met) {
      setMet(true);
      setTimeout(() => {
        onDiscoverCafe();
        toast("Новая отметка на карте", {
          description: "Кафе «Ленивая Лапка» добавлено в карту города.",
        });
      }, 1400);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setReply(null);
  };

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      {/* Street backdrop (CSS pixel art) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#1a1230 0%, #2a1b44 35%, #3a2456 55%, #1a0f24 100%)",
        }}
      />
      {/* Distant skyline */}
      <div
        className="absolute inset-x-0 top-1/4 h-32 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #0e0a1a 0 8%, #1a1330 8% 14%, #0e0a1a 14% 22%, #221635 22% 30%, #0e0a1a 30% 40%, #1a1330 40% 52%, #0e0a1a 52% 62%, #261a3e 62% 72%, #0e0a1a 72% 84%, #1d1432 84% 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 30%, black 100%)",
          imageRendering: "pixelated",
        }}
      />
      {/* Neon window dots */}
      <div
        className="absolute inset-x-0 top-1/4 h-32"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fbbf24 1px, transparent 2px), radial-gradient(circle, #7fe7ff 1px, transparent 2px)",
          backgroundSize: "24px 16px, 32px 20px",
          opacity: 0.45,
        }}
      />
      {/* Ground / sidewalk */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-[#241733] to-[#0a0612]" />
      <div
        className="absolute inset-x-0 bottom-1/3 h-1 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #facc15 0 14px, transparent 14px 28px)",
        }}
      />
      {/* Streetlight glow */}
      <div className="absolute left-[18%] bottom-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="absolute right-[22%] bottom-1/4 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

      {/* Shop sign */}
      <div className="absolute left-1/2 top-[28%] -translate-x-1/2 select-none text-center">
        <div className="font-['Press_Start_2P'] text-[10px] tracking-widest text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.7)]">
          МАГАЗИН · 24/7
        </div>
      </div>

      {/* Needs HUD — vertical bars with stickers */}
      <NeedsHud thirst={thirst} hunger={hunger} social={social} lonely={lonely} />

      {/* NPC: Рыжик */}
      <button
        type="button"
        onClick={openDialog}
        aria-label="Поговорить с Рыжиком"
        className="group absolute left-1/2 bottom-[22%] -translate-x-1/2 cursor-pointer focus:outline-none"
      >
        {/* Speech bubble icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce text-2xl drop-shadow-[0_0_8px_rgba(127,231,255,0.7)]">
          💬
        </div>
        {/* Cat sprite (CSS pixel) */}
        <CatSprite />
        <div className="mt-2 text-center font-['Press_Start_2P'] text-[8px] text-orange-300">
          РЫЖИК
        </div>
      </button>

      {/* Dialog modal */}
      {dialogOpen && (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="m-4 w-full max-w-xl rounded-xl border border-orange-400/30 bg-[#0a0e1a]/95 p-5 shadow-2xl ring-1 ring-white/5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-lg">
                🐱
              </div>
              <div>
                <div className="font-['Press_Start_2P'] text-[10px] text-orange-300">
                  РЫЖИК
                </div>
                <div className="text-[10px] text-white/40">
                  Отношение: {relation > 0 ? "+" : ""}
                  {relation}
                </div>
              </div>
            </div>

            {!reply ? (
              <>
                <p className="mb-4 rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-white/90">
                  «Привет. Ты новенький в этом районе, да? Я раньше тебя здесь
                  не видел.»
                </p>
                <div className="grid gap-2">
                  {CHOICES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => choose(c)}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-white/85 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
                    >
                      <span className="mr-2 text-cyan-300">{c.id}.</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-white/90">
                  «{reply}»
                </p>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="w-full rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-[#0a0e1a] transition hover:bg-cyan-300"
                >
                  Закрыть
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CatSprite() {
  // Simple CSS pixel cat in green jacket
  return (
    <div
      className="relative h-20 w-16"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Head */}
      <div className="absolute left-1/2 top-0 h-8 w-10 -translate-x-1/2 rounded-sm bg-orange-400 ring-2 ring-orange-700" />
      {/* Ears */}
      <div className="absolute left-1 top-0 h-3 w-3 -rotate-12 bg-orange-400" />
      <div className="absolute right-1 top-0 h-3 w-3 rotate-12 bg-orange-400" />
      {/* Eyes */}
      <div className="absolute left-3 top-3 h-1.5 w-1.5 bg-emerald-300" />
      <div className="absolute right-3 top-3 h-1.5 w-1.5 bg-emerald-300" />
      {/* Body (green jacket) */}
      <div className="absolute left-1/2 top-7 h-10 w-12 -translate-x-1/2 rounded-sm bg-emerald-600 ring-2 ring-emerald-900" />
      {/* Jacket zipper */}
      <div className="absolute left-1/2 top-8 h-8 w-0.5 -translate-x-1/2 bg-emerald-300/70" />
      {/* Legs */}
      <div className="absolute left-3 bottom-0 h-3 w-2.5 bg-stone-800" />
      <div className="absolute right-3 bottom-0 h-3 w-2.5 bg-stone-800" />
    </div>
  );
}

function NeedsHud({
  thirst,
  hunger,
  social,
  lonely,
}: {
  thirst: number;
  hunger: number;
  social: number;
  lonely: boolean;
}) {
  const bars = [
    { icon: "🥤", label: "Жажда", v: thirst, color: "from-cyan-300 to-cyan-500" },
    { icon: "🍔", label: "Голод", v: hunger, color: "from-amber-300 to-orange-500" },
    {
      icon: "💬",
      label: "Общение",
      v: social,
      color: lonely
        ? "from-rose-400 to-rose-600"
        : "from-fuchsia-300 to-violet-500",
    },
  ];
  return (
    <div className="absolute left-3 top-3 z-[55] flex gap-2">
      {bars.map((b) => (
        <div
          key={b.label}
          className="flex w-12 flex-col items-center rounded-md border border-white/10 bg-black/55 p-1.5 backdrop-blur"
        >
          <div className="text-base leading-none">{b.icon}</div>
          <div className="mt-1 text-[8px] uppercase tracking-wider text-white/60">
            {b.label}
          </div>
          <div className="relative mt-1 h-20 w-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${b.color} transition-all duration-500`}
              style={{ height: `${Math.max(0, Math.min(100, b.v))}%` }}
            />
          </div>
          <div className="mt-1 text-[8px] tabular-nums text-white/50">
            {Math.round(b.v)}
          </div>
        </div>
      ))}
    </div>
  );
}
