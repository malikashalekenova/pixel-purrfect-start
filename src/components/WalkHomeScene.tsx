import { useState } from "react";
import { modVitals } from "@/components/VitalsHUD";

type Props = {
  coins: number;
  onSpend: (amount: number) => boolean;
  onHome: () => void;
};

type RouteChoice = "shortcut" | "safe";

const SHORTCUT_OUTCOMES = [
  {
    text: "Ты срезал через тёмный двор. Тени шевельнулись, но район отпустил тебя без платы.",
    coins: 0,
    stability: 0,
  },
  {
    text: "У подъезда тебя окликнули незнакомцы. Пришлось откупиться мелочью и идти дальше.",
    coins: 5,
    stability: 0,
  },
  {
    text: "Ты ускорился через служебный проход. Дом ближе, но голова шумит от неона.",
    coins: 0,
    stability: -5,
  },
];

export function WalkHomeScene({ coins, onSpend, onHome }: Props) {
  const [choice, setChoice] = useState<RouteChoice | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  const chooseShortcut = () => {
    const result = SHORTCUT_OUTCOMES[Math.floor(Math.random() * SHORTCUT_OUTCOMES.length)];
    if (result.coins > 0) onSpend(result.coins);
    if (result.stability !== 0) modVitals({ stability: result.stability });
    setChoice("shortcut");
    setOutcome(result.text);
  };

  const chooseSafe = () => {
    modVitals({ stability: 5 });
    setChoice("safe");
    setOutcome(
      "Ты пошёл по освещённой улице. Дольше, зато район звучит тише, и мысли собираются обратно в одну линию.",
    );
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[#060914] text-white animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080b1d] via-[#161331] to-[#07040d]" />
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

          {!outcome ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={chooseShortcut}
                className="border-4 border-[#0a1016] bg-[#a78bfa] px-4 py-3 text-left text-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#c4b5fd] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
              >
                <span className="block font-['Press_Start_2P'] text-[10px]">Короткий путь</span>
                <span className="mt-2 block text-xs font-semibold opacity-80">
                  Быстрее, но район может взять плату.
                </span>
              </button>
              <button
                type="button"
                onClick={chooseSafe}
                className="border-4 border-[#0a1016] bg-[#34d399] px-4 py-3 text-left text-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
              >
                <span className="block font-['Press_Start_2P'] text-[10px]">Безопасный путь</span>
                <span className="mt-2 block text-xs font-semibold opacity-80">
                  Дольше, зато +5 стабильности.
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <div className="rounded-md border border-cyan-300/25 bg-cyan-400/10 p-4 text-sm leading-relaxed text-cyan-50">
                <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">
                  {choice === "shortcut" ? "маршрут: короткий" : "маршрут: безопасный"}
                </div>
                {outcome}
              </div>
              <button
                type="button"
                onClick={onHome}
                className="mt-4 w-full border-4 border-[#0a1016] bg-[#7fe7ff] px-5 py-3 font-['Press_Start_2P'] text-xs text-[#0a1016] shadow-[5px_5px_0_0_#0a1016] transition-transform hover:bg-[#a8f1ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_0_#0a1016]"
              >
                Вернуться домой
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
