import { useEffect, useState } from "react";
import { modVitals } from "@/components/VitalsHUD";
import dangerStreetImg from "@/assets/background_danger.jpg";

type Props = {
  coins: number;
  onSpend: (amount: number) => boolean;
  onHome: () => void;
};

type RouteChoice = "left" | "right";
type ScenePhase = "choose" | "ambush" | "escaped" | "safe";

const ESCAPE_STEPS = [
  { id: "left", label: "←", text: "Свернуть за вывеску" },
  { id: "right", label: "→", text: "Уйти от тени" },
  { id: "jump", label: "Прыгнуть", text: "Перепрыгнуть лужу" },
  { id: "sprint", label: "Ускориться", text: "Рвануть к дому" },
] as const;

const ESCAPE_LIMIT_SECONDS = 30;

type EscapeStep = (typeof ESCAPE_STEPS)[number]["id"];

export function WalkHomeScene({ coins, onSpend, onHome }: Props) {
  const [choice, setChoice] = useState<RouteChoice | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [phase, setPhase] = useState<ScenePhase>("choose");
  const [escapeIndex, setEscapeIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(ESCAPE_LIMIT_SECONDS);

  const chooseLeftPath = () => {
    setChoice("left");
    setPhase("ambush");
    setEscapeIndex(0);
    setMisses(0);
    setTimeLeft(ESCAPE_LIMIT_SECONDS);
    setOutcome(
      "Левый переулок оказался слишком пустым. Неон погас на секунду, и кто-то отделился от стены.",
    );
  };

  const chooseRightPath = () => {
    modVitals({ stability: 5 });
    setChoice("right");
    setPhase("safe");
    setOutcome(
      "Ты выбрал правую освещённую улицу. Дольше, зато район звучит тише, и мысли собираются обратно в одну линию.",
    );
  };

  const pressEscape = (step: EscapeStep) => {
    if (phase !== "ambush" || timeLeft <= 0) return;

    const expected = ESCAPE_STEPS[escapeIndex];
    if (!expected) return;

    if (step !== expected.id) {
      setMisses((n) => n + 1);
      setFlash("Слишком рано. Тень почти догнала.");
      modVitals({ stability: -2 });
      setTimeout(() => setFlash(null), 850);
      return;
    }

    setFlash(expected.text);
    setTimeout(() => setFlash(null), 850);

    const nextIndex = escapeIndex + 1;
    setEscapeIndex(nextIndex);
    if (nextIndex >= ESCAPE_STEPS.length) {
      const lostCoins = misses > 0 ? Math.min(5, coins) : 0;
      if (lostCoins > 0) onSpend(lostCoins);
      modVitals({ energy: -6, stability: misses > 0 ? -4 : 1 });
      setPhase("escaped");
      setOutcome(
        lostCoins > 0
          ? "Ты вырвался из переулка, но в рывке выронил пару монет. Дом уже виден за последним фонарём."
          : "Ты ушёл от тени чисто: шаг, рывок, прыжок — и пустая улица осталась позади.",
      );
    }
  };

  const escapeProgress = Math.round((escapeIndex / ESCAPE_STEPS.length) * 100);
  const timeProgress = Math.round((timeLeft / ESCAPE_LIMIT_SECONDS) * 100);

  useEffect(() => {
    if (phase !== "ambush") return;
    if (timeLeft <= 0) {
      modVitals({ energy: -10, stability: -10 });
      setPhase("escaped");
      setOutcome(
        "Ты замешкался. Тень успела подойти слишком близко, пришлось вырваться рывком почти вслепую. Дом рядом, но руки дрожат.",
      );
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, timeLeft]);

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[#060914] text-white animate-fade-in">
      {phase === "ambush" && (
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage: `linear-gradient(rgba(3,7,18,0.45), rgba(3,7,18,0.88)), url(${dangerStreetImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-[#080b1d] via-[#161331] to-[#07040d] ${
          phase === "ambush" ? "opacity-75" : ""
        }`}
      />
      <div className="absolute inset-x-0 top-[18%] h-48 opacity-80">
        <div className="h-full bg-[linear-gradient(90deg,#070512_0_10%,#15102b_10%_18%,#070512_18%_28%,#21183b_28%_38%,#070512_38%_50%,#17112d_50%_62%,#070512_62%_72%,#23163c_72%_82%,#070512_82%_100%)]" />
      </div>
      <div
        className="absolute inset-x-0 top-[18%] h-48 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle, #7fe7ff 1px, transparent 2px), radial-gradient(circle, #f472b6 1px, transparent 2px), radial-gradient(circle, #fbbf24 1px, transparent 2px)",
          backgroundSize: "30px 20px, 42px 24px, 54px 28px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#17101f] to-black" />
      <div className="absolute left-[15%] bottom-[28%] h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[8%] bottom-[18%] h-80 w-80 rounded-full bg-violet-400/12 blur-3xl" />
      <div
        className="absolute inset-x-0 bottom-[30%] h-1 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #7fe7ff 0 16px, transparent 16px 34px)",
        }}
      />

      <div className="relative z-10 flex min-h-full items-end justify-center p-4 sm:items-center">
        <div className="w-full max-w-2xl rounded-lg border-4 border-[#0a1016] bg-black/75 p-5 shadow-[8px_8px_0_0_#0a1016] backdrop-blur">
          <div className="mb-3 font-['Press_Start_2P'] text-sm text-cyan-200 sm:text-base">
            ДОРОГА ДОМОЙ
          </div>
          <p className="text-sm leading-relaxed text-white/75">
            Кофе согрел лапы. За окнами кафе район дышит неоном, мокрым асфальтом и
            поздними сигналами. Дом близко, но Shadow District редко отдаёт путь просто так.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
            <span>Кошелёк</span>
            <span className="text-amber-300">🪙 {coins}</span>
          </div>

          {phase === "choose" ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={chooseLeftPath}
                className="border-4 border-[#0a1016] bg-[#a78bfa] px-4 py-3 text-left text-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#c4b5fd] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
              >
                <span className="block font-['Press_Start_2P'] text-[10px]">Левый путь</span>
                <span className="mt-2 block text-xs font-semibold opacity-80">
                  Быстрее. Тот самый переулок, о котором шептал Нуар.
                </span>
              </button>
              <button
                type="button"
                onClick={chooseRightPath}
                className="border-4 border-[#0a1016] bg-[#34d399] px-4 py-3 text-left text-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
              >
                <span className="block font-['Press_Start_2P'] text-[10px]">Правый путь</span>
                <span className="mt-2 block text-xs font-semibold opacity-80">
                  Светлее и спокойнее. Дольше, зато +5 стабильности.
                </span>
              </button>
            </div>
          ) : phase === "ambush" ? (
            <div className="mt-5">
              <div className="relative overflow-hidden rounded-md border border-rose-300/40 bg-rose-950/40 p-4 text-sm leading-relaxed text-rose-50 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                <div className="absolute right-4 top-3 font-['Press_Start_2P'] text-[10px] text-rose-300/70">
                  УГРОЗА
                </div>
                <div className="mb-2 font-['Press_Start_2P'] text-[11px] text-rose-200">
                  Нападение из тени
                </div>
                <p>{outcome}</p>
                <p className="mt-3 text-cyan-100">
                  Нажми действия по порядку меньше чем за 30 секунд, чтобы сбросить
                  преследователя и добежать домой.
                </p>

                <div className="mt-4 flex items-center justify-between text-[11px] text-white/65">
                  <span>Таймер</span>
                  <span
                    className={`font-['Press_Start_2P'] text-[10px] ${
                      timeLeft <= 10 ? "text-rose-200 animate-pulse" : "text-cyan-200"
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
                  <div
                    className={`h-full transition-all ${
                      timeLeft <= 10 ? "bg-rose-300" : "bg-amber-300"
                    }`}
                    style={{ width: `${timeProgress}%` }}
                  />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full bg-cyan-300 transition-all"
                    style={{ width: `${escapeProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-white/55">
                  Шаг {Math.min(escapeIndex + 1, ESCAPE_STEPS.length)} / {ESCAPE_STEPS.length}
                  {misses > 0 && <span className="text-rose-200"> · ошибки: {misses}</span>}
                </div>

                {flash && (
                  <div className="mt-3 rounded border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                    {flash}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ESCAPE_STEPS.map((step, index) => {
                  const done = index < escapeIndex;
                  const current = index === escapeIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => pressEscape(step.id)}
                      className={`border-4 border-[#0a1016] px-3 py-3 font-['Press_Start_2P'] text-[10px] shadow-[4px_4px_0_0_#0a1016] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0a1016] ${
                        done
                          ? "bg-emerald-300 text-[#07101a]"
                          : current
                            ? "bg-[#7fe7ff] text-[#07101a] animate-pulse"
                            : "bg-white/15 text-white/50"
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <div className="rounded-md border border-cyan-300/25 bg-cyan-400/10 p-4 text-sm leading-relaxed text-cyan-50">
                <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">
                  {choice === "left" ? "маршрут: левый" : "маршрут: правый"}
                </div>
                {outcome}
              </div>
              <button
                type="button"
                onClick={onHome}
                className="mt-4 w-full border-4 border-[#0a1016] bg-[#7fe7ff] px-5 py-3 font-['Press_Start_2P'] text-xs text-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#a8f1ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
              >
                {choice === "left" ? "Бежать домой" : "Вернуться домой"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
