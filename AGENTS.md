# Project Rules

- Never commit a real `.env` file.
- Always keep `.env.example` committed and up to date when environment variables change.
- If creating ready-to-copy Vercel env handoff files, use `VERCEL_ENV_IMPORT.local.env` and `VERCEL_ENV_VALUES.local.md`; they must stay local only and be ignored by git.
- Do not expose API keys, tokens, database URLs, private keys, service-role keys, or other secrets in chat, logs, docs intended for git, or public frontend variables.
- Public frontend variables such as `VITE_*`, `NEXT_PUBLIC_*`, and similar are visible in the browser. Only put public values there.
- Supabase anon/public publishable keys may be used in frontend variables. Supabase service role keys must stay backend/server-only.
- Gemini API keys must stay backend/server-only and must not use a `VITE_*` prefix.
- For Gemini features, default to `gemini-2.5-flash-lite` for free/low-cost student usage.
- Do not require `SUPABASE_SERVICE_ROLE_KEY` unless backend admin privileges are actually used by the app.
- Remote font CSS imports can break Lightning CSS/Vite builds; prefer document/head font links.
- App database tables must exist in Supabase before Vercel or local runtime can query them.
- Keep Vercel config minimal and targeted to this TanStack Start/Vite/Nitro app.
- Do not change unrelated app logic for deployment work.
