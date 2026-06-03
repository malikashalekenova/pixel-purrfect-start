import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CharacterCreation } from "@/components/CharacterCreation";
import { PhoneReveal } from "@/components/PhoneReveal";
import { CafeScene } from "@/components/CafeScene";
import { CatSprite } from "@/components/CatSprite";
import { modVitals, getVitals } from "@/components/VitalsHUD";
import type { Profile } from "@/lib/profile";


type MoodTier = "friend" | "neutral" | "negative" | "hate";

function moodFromScore(rel: number): MoodTier {
  const score = rel * 8;
  if (score >= 20) return "friend";
  if (score >= -10) return "neutral";
  if (score >= -35) return "negative";
  return "hate";
}

const MOOD_META: Record<MoodTier, { icon: string; ring: string; label: string; line: string }> = {
  friend:   { icon: "💚", ring: "ring-emerald-400 bg-emerald-500/20", label: "Дружелюбие", line: "Привет! Рад тебя видеть!" },
  neutral:  { icon: "😐", ring: "ring-zinc-400 bg-zinc-500/20",       label: "Нейтрально", line: "..." },
  negative: { icon: "😾", ring: "ring-rose-500 bg-rose-500/20",       label: "Негатив",    line: "Я тебе не доверяю..." },
  hate:     { icon: "🚫", ring: "ring-red-600 bg-red-900/40",         label: "Отказ",      line: "Уйди." },
};

function MoodBadge({ tier }: { tier: MoodTier }) {
  const m = MOOD_META[tier];
  return (
    <div
      className={`absolute -top-16 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full ring-2 ${m.ring} backdrop-blur text-sm shadow-lg`}
      title={m.label}
      style={{ animation: tier === "hate" ? "vitals-flicker 0.4s steps(2) infinite" : undefined }}
    >
      {m.icon}
    </div>
  );
}

type Props = {
  onCommunicate: (delta: number) => void;
  onDiscoverCafe: () => void;
  hasProfile: boolean;
  onProfileCreated: (profile: Profile) => void;
  coins: number;
  onSpend: (amount: number) => boolean;
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


export function Street({ onCommunicate, onDiscoverCafe, hasProfile, onProfileCreated, coins, onSpend }: Props) {
  // Dialog state
  const [activeNpc, setActiveNpc] = useState<NpcId | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [relPushok, setRelPushok] = useState(0);
  const [relRyzhik, setRelRyzhik] = useState(0);
  const [metPushok, setMetPushok] = useState(false);
  const [metRyzhik, setMetRyzhik] = useState(false);

  // Character creation flow
  const [showCreation, setShowCreation] = useState(false);
  const [pushokFarewell, setPushokFarewell] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showCafe, setShowCafe] = useState(false);

  const moodPushok = moodFromScore(relPushok);
  const moodRyzhik = moodFromScore(relRyzhik);

  const openDialog = (npc: NpcId) => {
    const tier = npc === "pushok" ? moodPushok : moodRyzhik;
    if (tier === "hate") {
      toast("NPC игнорирует тебя", { description: "Попробуй поговорить с другими котами." });
      return;
    }
    setActiveNpc(npc);
    setReply(null);
  };

  const choose = (c: DialogChoice) => {
    if (!activeNpc) return;
    setReply(c.reply);
    onCommunicate(c.xp);

    if (activeNpc === "pushok") {
      setRelPushok((r) => r + c.rel);
      if (!metPushok) {
        setMetPushok(true);
        toast("Новый знакомый: Пушок", {
          description: "Пушок будет иногда встречаться в районе.",
        });
      }
    } else {
      setRelRyzhik((r) => r + c.rel);
      if (!metRyzhik) {
        setMetRyzhik(true);
        setTimeout(() => {
          onDiscoverCafe();
          toast("Новая отметка на карте", {
            description: "Кафе «Ленивая Лапка» добавлено в карту города.",
          });
        }, 1400);
      }
    }
  };

  const closeDialog = () => {
    const wasPushok = activeNpc === "pushok";
    const justMetPushok = wasPushok && metPushok && !hasProfile && !showCreation && !pushokFarewell;
    setActiveNpc(null);
    setReply(null);
    // After first Пушок dialog, if player has no profile yet — open character creation
    if (justMetPushok) {
      setTimeout(() => setShowCreation(true), 400);
    }
  };

  const handleProfileCreated = (profile: Profile) => {
    setShowCreation(false);
    onProfileCreated(profile);
  };

  const handlePhoneComplete = () => {
    setShowPhone(false);
    onDiscoverCafe();
    setShowCafe(true);
  };

  const handleCafeExit = () => {
    setShowCafe(false);
    toast("📍 Кафе отмечено на карте", { description: "Ты вышел обратно в город." });
    setPushokFarewell(true);
    setTimeout(() => setPushokFarewell(false), 5000);
  };


  const currentChoices = activeNpc === "pushok" ? PUSHOK_CHOICES : RYZHIK_CHOICES;
  const currentIntro = activeNpc === "pushok" ? PUSHOK_INTRO : RYZHIK_INTRO;
  const currentName = activeNpc === "pushok" ? "ПУШОК" : "РЫЖИК";
  const currentRel = activeNpc === "pushok" ? relPushok : relRyzhik;
  const currentAccent =
    activeNpc === "pushok" ? "from-amber-200 to-yellow-400" : "from-orange-400 to-amber-600";
  const currentBorder =
    activeNpc === "pushok" ? "border-yellow-300/40" : "border-orange-400/30";
  const currentLabelColor =
    activeNpc === "pushok" ? "text-yellow-200" : "text-orange-300";


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
      

      {/* NPC: Пушок (первый знакомый) */}
      <button
        type="button"
        onClick={() => openDialog("pushok")}
        aria-label="Поговорить с Пушком"
        className="group absolute left-[28%] bottom-[20%] cursor-pointer focus:outline-none transition-opacity"
        style={{ opacity: moodPushok === "hate" ? 0.35 : 1 }}
      >
        <MoodBadge tier={moodPushok} />
        {pushokFarewell && (
          <div className="absolute -top-28 left-1/2 z-10 w-56 -translate-x-1/2 rounded-2xl bg-white px-3 py-2 text-[11px] leading-snug text-stone-800 shadow-2xl ring-1 ring-black/10 animate-fade-in">
            «Надеюсь, тебе понравится в нашем городе!»
            <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
          </div>
        )}
        <CatSprite size="md" />
        <div className="mt-2 text-center font-['Press_Start_2P'] text-[8px] text-yellow-200">
          ПУШОК
        </div>
      </button>


      {/* NPC: Рыжик */}
      <button
        type="button"
        onClick={() => openDialog("ryzhik")}
        aria-label="Поговорить с Рыжиком"
        className="group absolute left-[68%] bottom-[22%] -translate-x-1/2 cursor-pointer focus:outline-none transition-opacity"
        style={{ opacity: moodRyzhik === "hate" ? 0.35 : 1 }}
      >
        <MoodBadge tier={moodRyzhik} />
        <img
          src={ryzhikImg}
          alt="Рыжик"
          className="h-24 w-24 sm:h-28 sm:w-28 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
        />
        <div className="mt-2 text-center font-['Press_Start_2P'] text-[8px] text-orange-300">
          РЫЖИК
        </div>
      </button>




      {/* Dialog modal */}
      {activeNpc && (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className={`m-4 w-full max-w-xl rounded-xl border ${currentBorder} bg-[#0a0e1a]/95 p-5 shadow-2xl ring-1 ring-white/5`}>
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-12 w-10 items-center justify-center rounded-md bg-gradient-to-br ${currentAccent}`}>
                <CatSprite size="xs" />
              </div>

              <div>
                <div className={`font-['Press_Start_2P'] text-[10px] ${currentLabelColor}`}>
                  {currentName}
                </div>
                <div className="text-[10px] text-white/40">
                  Отношение: {currentRel > 0 ? "+" : ""}
                  {currentRel}
                </div>
              </div>
            </div>

            {!reply ? (
              <>
                <p className="mb-4 rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-white/90">
                  «{currentIntro}»
                </p>
                <div className="grid gap-2">
                  {currentChoices.map((c) => (
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

      {/* Character creation after meeting Пушок */}
      {showCreation && <CharacterCreation onCreated={handleProfileCreated} />}

      {/* Cinematic phone reveal → opens map mission to cafe */}
      {showPhone && <PhoneReveal onComplete={handlePhoneComplete} />}

      {/* Cafe interior */}
      {showCafe && <CafeScene onExit={handleCafeExit} coins={coins} onSpend={onSpend} />}

      {/* Pull phone from pocket button */}
      <button
        type="button"
        onClick={() => setShowPhone(true)}
        className="absolute right-4 bottom-4 z-30 rounded-full bg-cyan-400/20 px-4 py-2 text-xs font-bold text-cyan-100 ring-1 ring-cyan-300/50 backdrop-blur hover:bg-cyan-400/40 transition animate-pulse"
      >
        📱 Вытащить телефон
      </button>
    </div>
  );
}

// Котики унифицированы — см. src/components/CatSprite.tsx
