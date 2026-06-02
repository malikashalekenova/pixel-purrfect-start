import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FUR_COLORS,
  EYE_COLORS,
  CLOTHING,
  updateMyProfile,
  type Profile,
} from "@/lib/profile";

type Props = {
  onCreated: (profile: Profile) => void;
};

export function CharacterCreation({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [fur, setFur] = useState<string>(FUR_COLORS[0].id);
  const [eyes, setEyes] = useState<string>(EYE_COLORS[0].id);
  const [clothing, setClothing] = useState<string>(CLOTHING[0].id);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    if (!name.trim()) return setErr("Введите имя персонажа.");
    if (!email.includes("@")) return setErr("Введите корректный email.");
    if (password.length < 6) return setErr("Пароль минимум 6 символов.");

    setLoading(true);

    // Sign up; if user exists, try sign in
    let { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: name, display_name: name },
      },
    });

    if (signUpErr && /registered|exists/i.test(signUpErr.message)) {
      const { data: signInData, error: signInErr } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setErr(signInErr.message);
        setLoading(false);
        return;
      }
      signUpData = { user: signInData.user, session: signInData.session };
    } else if (signUpErr) {
      setErr(signUpErr.message);
      setLoading(false);
      return;
    }

    if (!signUpData?.user) {
      setErr("Не удалось создать аккаунт.");
      setLoading(false);
      return;
    }

    // Profile auto-created by trigger; update with chosen options
    const updated = await updateMyProfile({
      display_name: name,
      fur_color: fur,
      eye_color: eyes,
      clothing,
    });

    if (!updated) {
      setErr("Не удалось сохранить профиль.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => onCreated(updated), 1600);
  };

  if (success) {
    return (
      <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/90 animate-fade-in">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl animate-scale-in">✨</div>
          <div className="font-['Press_Start_2P'] text-xl text-cyan-300 drop-shadow-[0_0_12px_rgba(127,231,255,0.6)]">
            ПРОФИЛЬ СОЗДАН
          </div>
          <div className="text-sm text-white/60">Возвращаемся на улицу...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0a0f1a] p-5 text-white shadow-2xl my-4"
      >
        <div className="mb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
            Shadow District
          </p>
          <h2 className="mt-1 text-2xl font-bold">Создание персонажа</h2>
          <p className="mt-1 text-xs text-white/50">
            Расскажи о себе, чтобы город тебя запомнил.
          </p>
        </div>

        {/* Name */}
        <label className="block text-xs font-medium text-white/70">
          Имя персонажа
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="Например, Тень"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
          />
        </label>

        {/* Fur color */}
        <div className="mt-4">
          <div className="text-xs font-medium text-white/70">Цвет шерсти</div>
          <div className="mt-1.5 flex gap-2">
            {FUR_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setFur(c.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 ring-1 transition ${
                  fur === c.id
                    ? "ring-cyan-400 bg-cyan-400/10"
                    : "ring-white/10 hover:ring-white/30"
                }`}
              >
                <span
                  className="h-7 w-7 rounded-full ring-2 ring-black/40"
                  style={{ background: c.hex }}
                />
                <span className="text-[10px] text-white/70">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Eye color */}
        <div className="mt-4">
          <div className="text-xs font-medium text-white/70">Цвет глаз</div>
          <div className="mt-1.5 flex gap-2">
            {EYE_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setEyes(c.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 ring-1 transition ${
                  eyes === c.id
                    ? "ring-cyan-400 bg-cyan-400/10"
                    : "ring-white/10 hover:ring-white/30"
                }`}
              >
                <span
                  className="h-7 w-7 rounded-full ring-2 ring-black/40"
                  style={{ background: c.hex }}
                />
                <span className="text-[10px] text-white/70">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clothing */}
        <div className="mt-4">
          <div className="text-xs font-medium text-white/70">Стартовая одежда</div>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {CLOTHING.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setClothing(c.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-3 ring-1 transition ${
                  clothing === c.id
                    ? "ring-cyan-400 bg-cyan-400/10"
                    : "ring-white/10 hover:ring-white/30"
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] text-white/70">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auth */}
        <div className="mt-5 rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">
            Сохранение прогресса
          </div>
          <label className="block text-xs font-medium text-white/70">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm focus:border-cyan-400/50 focus:outline-none"
            />
          </label>
          <label className="mt-2 block text-xs font-medium text-white/70">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm focus:border-cyan-400/50 focus:outline-none"
            />
          </label>
        </div>

        {err && (
          <div className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-400 px-4 py-3 font-['Press_Start_2P'] text-xs text-[#0a0e1a] shadow-[0_10px_30px_-10px_rgba(127,231,255,0.7)] transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Сохраняем..." : "НАЧАТЬ ИСТОРИЮ →"}
        </button>
      </form>
    </div>
  );
}
