import { useMemo, useState } from "react";
import { Bot, Send, X, Zap } from "lucide-react";
import { getVitals } from "@/components/VitalsHUD";
import { levelFromXp, type Profile } from "@/lib/profile";

type Stage =
  | "menu"
  | "intro"
  | "zooming"
  | "desktop"
  | "mission"
  | "workshop"
  | "done"
  | "room-after"
  | "street";

type Props = {
  profile: Profile | null;
  coins: number;
  xp: number;
  stage: Stage;
  onClose: () => void;
};

const QUICK_PROMPTS = [
  "Что делать дальше?",
  "Как заработать монеты?",
  "Как не проиграть?",
  "Какой контракт взять?",
];

export function AIAdvisorWindow({ profile, coins, xp, stage, onClose }: Props) {
  const [question, setQuestion] = useState(QUICK_PROMPTS[0]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const player = useMemo(() => {
    const vitals = getVitals();
    return {
      name: profile?.display_name ?? profile?.username ?? null,
      coins,
      xp,
      level: profile?.level ?? levelFromXp(xp),
      stage,
      vitals,
    };
  }, [coins, profile, stage, xp]);

  const askMentor = async (text = question) => {
    const nextQuestion = text.trim();
    if (!nextQuestion || loading) return;
    setQuestion(nextQuestion);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nextQuestion,
          player,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "AI Mentor временно недоступен. Попробуй позже.");
        return;
      }
      setAnswer(data?.answer ?? "NODE-7 молчит. Попробуй сформулировать вопрос иначе.");
    } catch {
      setError("AI Mentor временно недоступен. Попробуй позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-cyan-400/25 bg-[#080d18] text-white shadow-[0_30px_90px_-30px_rgba(34,211,238,0.5)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
              <Bot size={19} />
            </div>
            <div>
              <h2 className="font-['Press_Start_2P'] text-sm text-cyan-200">AI Mentor</h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/40">
                NODE-7 / shadow district uplink
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Закрыть AI Mentor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[190px_1fr] sm:p-5">
          <aside className="rounded-md border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-violet-300/80">
              Player state
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-white/40">Имя</dt>
                <dd className="truncate text-right text-white/80">
                  {player.name ?? "guest"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Монеты</dt>
                <dd className="text-amber-300">{player.coins}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">XP</dt>
                <dd className="text-cyan-300">{player.xp}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Уровень</dt>
                <dd className="text-cyan-300">{player.level}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Локация</dt>
                <dd className="text-violet-200">{player.stage}</dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
              <div className="rounded border border-red-400/20 bg-red-500/10 p-1.5 text-red-200">
                HP {Math.round(player.vitals.health)}
              </div>
              <div className="rounded border border-emerald-400/20 bg-emerald-500/10 p-1.5 text-emerald-200">
                EN {Math.round(player.vitals.energy)}
              </div>
              <div className="rounded border border-cyan-400/20 bg-cyan-500/10 p-1.5 text-cyan-200">
                ST {Math.round(player.vitals.stability)}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askMentor(prompt)}
                  disabled={loading}
                  className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs font-medium text-white/60">
              Вопрос для NODE-7
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/50"
                placeholder="Например: какой контракт взять сейчас?"
              />
            </label>

            {error && (
              <div className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => askMentor()}
              disabled={loading || !question.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan-300 to-violet-300 px-4 py-2.5 text-sm font-semibold text-[#08101c] transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? <Zap size={16} className="animate-pulse" /> : <Send size={16} />}
              {loading ? "Сканирую район..." : "Спросить"}
            </button>

            <div className="mt-4 min-h-32 rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
                NODE-7 response
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {answer ??
                  "Канал открыт. Спроси, куда двигаться дальше, и я просчитаю самый живой маршрут через этот район."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
