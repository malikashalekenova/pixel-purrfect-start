import { useEffect, useRef, useState } from "react";

type Scene = {
  title: string;
  text: string;
  accent: string;
};

const SCENES: Scene[] = [
  {
    title: "ДОБРО ПОЖАЛОВАТЬ",
    text: "Это Shadow District — город теней, где даже коты вынуждены бороться за место под неоновым солнцем.",
    accent: "#7fe7ff",
  },
  {
    title: "ТВОЯ ЦЕЛЬ",
    text: "Выжить, заработать репутацию и подняться со дна — из грязной комнатки до вершины криминальной сети.",
    accent: "#a78bfa",
  },
  {
    title: "МЕХАНИКИ",
    text: "Бери контракты на компьютере, выполняй мини-игры в мастерской, следи за здоровьем и умом.",
    accent: "#34d399",
  },
  {
    title: "ОСОБЕННОСТИ",
    text: "Знакомься с жителями района, прокачивай персонажа и открывай новые улицы. Каждое решение оставляет след.",
    accent: "#fbbf24",
  },
  {
    title: "УДАЧИ",
    text: "Тени уже ждут тебя. Игра начинается...",
    accent: "#ff6b6b",
  },
];

const SCENE_MS = 5000;

export function GameIntro({ onFinish }: { onFinish: () => void }) {
  const [idx, setIdx] = useState(0);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    onFinish();
  };

  // Narrate via browser TTS
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const fullText = SCENES.map((s) => s.text).join(" ");
    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = "ru-RU";
    u.rate = 1.0;
    u.pitch = 1.0;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const ru = voices.find((v) => v.lang?.toLowerCase().startsWith("ru"));
      if (ru) u.voice = ru;
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {}
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      pickVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  // Advance scenes
  useEffect(() => {
    if (idx >= SCENES.length) {
      const t = setTimeout(finish, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => i + 1), SCENE_MS);
    return () => clearTimeout(t);
  }, [idx]);

  const scene = SCENES[Math.min(idx, SCENES.length - 1)];
  const progress = Math.min(((idx + 1) / SCENES.length) * 100, 100);

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-black animate-fade-in">
      {/* Cinematic letterbox */}
      <div className="h-[8vh] w-full bg-black" />

      <div className="relative flex-1 overflow-hidden">
        {/* Animated backdrop */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(800px 500px at 30% 40%, ${scene.accent}22, transparent 60%), radial-gradient(700px 500px at 80% 80%, ${scene.accent}18, transparent 60%), linear-gradient(160deg, #05070d 0%, #0a0e1a 50%, #05070d 100%)`,
          }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
          }}
        />

        {/* Content */}
        <div
          key={idx}
          className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center animate-fade-in"
        >
          <div
            className="mb-4 text-[11px] uppercase tracking-[0.5em]"
            style={{ color: scene.accent }}
          >
            AI Intro · Глава {idx + 1} / {SCENES.length}
          </div>
          <h2
            className="font-['Press_Start_2P'] text-3xl leading-tight sm:text-5xl md:text-6xl"
            style={{
              color: scene.accent,
              textShadow: `0 0 20px ${scene.accent}80, 4px 4px 0 #000`,
            }}
          >
            {scene.title}
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg md:text-xl">
            {scene.text}
          </p>

          {/* Animated speaker pulse */}
          <div className="mt-10 flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className="w-1.5 rounded-full"
                style={{
                  background: scene.accent,
                  height: `${30 + Math.abs(Math.sin((Date.now() / 200) + i)) * 50}%`,
                  animation: `pulse 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-6 left-1/2 z-20 w-[60%] max-w-xl -translate-x-1/2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: scene.accent, boxShadow: `0 0 12px ${scene.accent}` }}
            />
          </div>
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-4 z-20 rounded-md border border-white/20 bg-black/40 px-3 py-1.5 text-xs uppercase tracking-widest text-white/70 backdrop-blur transition hover:bg-white/10 hover:text-white"
        >
          Пропустить ▶
        </button>
      </div>

      <div className="h-[8vh] w-full bg-black" />

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
