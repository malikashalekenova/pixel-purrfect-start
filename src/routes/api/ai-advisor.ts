import { createFileRoute } from "@tanstack/react-router";

type AdvisorPayload = {
  question?: unknown;
  player?: {
    name?: unknown;
    coins?: unknown;
    xp?: unknown;
    level?: unknown;
    stage?: unknown;
    vitals?: {
      health?: unknown;
      energy?: unknown;
      stability?: unknown;
    };
  };
};

const FALLBACK_MODEL = "gemini-2.5-flash-lite";
const MAX_QUESTION_LENGTH = 500;

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export const Route = createFileRoute("/api/ai-advisor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: AdvisorPayload;
        try {
          body = (await request.json()) as AdvisorPayload;
        } catch {
          return json({ error: "Некорректный JSON запрос." }, 400);
        }

        const question = cleanText(body.question);
        if (!question) return json({ error: "Вопрос не может быть пустым." }, 400);
        if (question.length > MAX_QUESTION_LENGTH) {
          return json({ error: "Вопрос слишком длинный. Максимум 500 символов." }, 400);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return json(
            { error: "AI Mentor не настроен: добавь GEMINI_API_KEY на сервере." },
            503,
          );
        }

        const model = cleanText(process.env.GEMINI_MODEL, FALLBACK_MODEL) || FALLBACK_MODEL;
        const player = body.player ?? {};
        const vitals = player.vitals ?? {};
        const playerState = {
          name: cleanText(player.name, "guest").slice(0, 60) || "guest",
          coins: finiteNumber(player.coins),
          xp: finiteNumber(player.xp),
          level: finiteNumber(player.level, 1),
          stage: cleanText(player.stage, "unknown").slice(0, 40) || "unknown",
          vitals: {
            health: finiteNumber(vitals.health, 100),
            energy: finiteNumber(vitals.energy, 100),
            stability: finiteNumber(vitals.stability, 100),
          },
        };

        const prompt = [
          "Ты AI Mentor в игре Shadow District.",
          "Отвечай на русском языке. Тон: киберпанк, glitchy terminal, умный подпольный помощник.",
          "Давай конкретный следующий шаг игроку. Не раскрывай, что ты внешняя модель.",
          "Не проси реальные секреты, пароли, токены, карты или личные данные. Не обещай невозможного.",
          "Ответ должен быть коротким, атмосферным и полезным: примерно 100-160 слов.",
          "",
          `Состояние игрока: ${JSON.stringify(playerState)}`,
          `Вопрос игрока: ${question}`,
        ].join("\n");

        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 260,
              },
            }),
          });

          if (!response.ok) {
            return json({ error: "AI Mentor временно недоступен. Попробуй позже." }, 502);
          }

          const data = await response.json();
          const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof answer !== "string" || !answer.trim()) {
            return json({ error: "AI Mentor не смог собрать ответ. Попробуй ещё раз." }, 502);
          }

          return json({ answer: answer.trim() });
        } catch {
          return json({ error: "AI Mentor временно недоступен. Попробуй позже." }, 502);
        }
      },
    },
  },
});
