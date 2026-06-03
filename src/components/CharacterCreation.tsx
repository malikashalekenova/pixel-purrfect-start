import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  FUR_COLORS,
  EYE_COLORS,
  CLOTHING,
  getCurrentProfile,
  ensureCurrentProfile,
  updateMyProfile,
  type Profile,
} from "@/lib/profile";

type Props = {
  onCreated: (profile: Profile) => void;
};

type Mode = "signup" | "login";
type Step = "auth" | "character";

/** Reject after `ms` so a stuck network call can never freeze the UI. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${label} timeout (${ms}ms)`)),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export function CharacterCreation({ onCreated }: Props) {
  const [step, setStep] = useState<Step>("auth");
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [fur, setFur] = useState<string>(FUR_COLORS[0].id);
  const [eyes, setEyes] = useState<string>(EYE_COLORS[0].id);
  const [clothing, setClothing] = useState<string>(CLOTHING[0].id);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null);

  const finishWith = (p: Profile) => {
    setSuccess(true);
    setTimeout(() => onCreated(p), 800);
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    if (!email.includes("@")) return setErr("Введите корректный email.");
    if (password.length < 6) return setErr("Пароль минимум 6 символов.");

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          15000,
          "Вход",
        );
        if (error) {
          setErr(error.message);
          return;
        }
        const profile =
          (await ensureCurrentProfile()) ?? (await getCurrentProfile());
        if (!profile) {
          setErr("Не удалось загрузить профиль.");
          return;
        }
        // Existing user with character → straight into the game.
        if (profile.display_name && profile.display_name !== profile.username) {
          finishWith(profile);
        } else {
          setExistingProfile(profile);
          setName(profile.display_name ?? profile.username ?? "");
          setStep("character");
        }
        return;
      }

      // ============ signup ============
      const { data: signUpData, error: signUpErr } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        }),
        15000,
        "Регистрация",
      );

      if (signUpErr) {
        if (/registered|exists|already/i.test(signUpErr.message)) {
          setErr("Этот email уже занят. Переключись на «Войти».");
        } else {
          setErr(signUpErr.message);
        }
        return;
      }
      if (!signUpData?.user) {
        setErr("Не удалось создать аккаунт.");
        return;
      }
      // No session means email confirmation is still required.
      if (!signUpData.session) {
        setErr(
          "Проверь почту и подтверди email, затем нажми «Войти».",
        );
        setMode("login");
        return;
      }

      // Ensure profile exists (trigger may have failed silently).
      const profile = await withTimeout(
        ensureCurrentProfile(),
        8000,
        "Загрузка профиля",
      );
      setExistingProfile(profile);
      if (profile?.display_name) setName(profile.display_name);
      setStep("character");
    } catch (e) {
      console.error("[auth] submit failed", e);
      setErr(e instanceof Error ? e.message : "Что-то пошло не так.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error)
        return setErr(result.error.message ?? "Не удалось войти через Google.");
      if (result.redirected) return;
      const profile =
        (await ensureCurrentProfile()) ?? (await getCurrentProfile());
      if (!profile) return setErr("Профиль не найден.");
      if (profile.display_name && profile.display_name !== profile.username) {
        finishWith(profile);
      } else {
        setExistingProfile(profile);
        setName(profile.display_name ?? profile.username ?? "");
        setStep("character");
      }
    } catch (e) {
      console.error("[auth] google failed", e);
      setErr(e instanceof Error ? e.message : "Ошибка Google входа.");
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    if (!name.trim()) return setErr("Введите имя персонажа.");
    setLoading(true);
    try {
      const updated = await withTimeout(
        updateMyProfile({
          display_name: name.trim(),
          fur_color: fur,
          eye_color: eyes,
          clothing,
        }),
        10000,
        "Сохранение",
      );
      const profile = updated ?? (await getCurrentProfile());
      if (!profile) return setErr("Не удалось сохранить профиль.");
      finishWith(profile);
    } catch (e) {
      console.error("[character] save failed", e);
      setErr(e instanceof Error ? e.message : "Ошибка сохранения.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0a0f1a] animate-fade-in">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="text-6xl animate-scale-in">✨</div>
          <div className="font-['Press_Start_2P'] text-base sm:text-xl text-cyan-300 drop-shadow-[0_0_12px_rgba(127,231,255,0.6)]">
            {step === "auth" ? "С ВОЗВРАЩЕНИЕМ" : "ПРОФИЛЬ СОЗДАН"}
          </div>
          <div className="text-sm text-white/60">Загружаем город...</div>
        </div>
      </div>
    );
  }

  // ============ AUTH STEP ============
  if (step === "auth") {
    const isLogin = mode === "login";
    return (
      <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-[#0a0f1a] overflow-y-auto animate-fade-in">
        <form
          onSubmit={handleAuthSubmit}
          className="w-full max-w-md mx-auto flex flex-col justify-center p-5 sm:p-8 text-white min-h-full"
        >
          <div className="mb-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
              Shadow District
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
              {isLogin ? "Вход в аккаунт" : "Регистрация"}
            </h2>
            <p className="mt-2 text-xs text-white/50">
              {isLogin
                ? "Войди по email и паролю, чтобы продолжить."
                : "Создай аккаунт, потом настроишь персонажа."}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => { setMode("signup"); setErr(null); }}
              className={`rounded-md py-2 text-xs font-medium transition ${!isLogin ? "bg-cyan-400/20 text-cyan-100" : "text-white/50 hover:text-white"}`}
            >
              Регистрация
            </button>
            <button
              type="button"
              onClick={() => { setMode("login"); setErr(null); }}
              className={`rounded-md py-2 text-xs font-medium transition ${isLogin ? "bg-cyan-400/20 text-cyan-100" : "text-white/50 hover:text-white"}`}
            >
              Войти
            </button>
          </div>

          <label className="block text-xs font-medium text-white/70">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base sm:text-sm focus:border-cyan-400/50 focus:outline-none"
            />
          </label>
          <label className="mt-3 block text-xs font-medium text-white/70">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base sm:text-sm focus:border-cyan-400/50 focus:outline-none"
            />
          </label>

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
            {loading ? (isLogin ? "Входим..." : "Регистрация...") : (isLogin ? "ВОЙТИ →" : "ДАЛЕЕ →")}
          </button>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-white/30">
            <div className="h-px flex-1 bg-white/10" />
            или
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-4 py-3 text-sm font-medium text-[#0a0e1a] transition hover:bg-white/90 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Войти через Google
          </button>
        </form>
      </div>
    );
  }

  // ============ CHARACTER STEP ============
  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-[#0a0f1a] overflow-y-auto animate-fade-in">
      <form
        onSubmit={handleCharacterSubmit}
        className="w-full max-w-2xl mx-auto flex flex-col p-5 sm:p-8 text-white min-h-full"
      >
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
            Шаг 2 из 2
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Создание персонажа</h2>
          <p className="mt-2 text-xs text-white/50">
            Расскажи о себе, чтобы город тебя запомнил.
          </p>
        </div>

        <label className="block text-xs font-medium text-white/70">
          Имя персонажа
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="Например, Тень"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base sm:text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
          />
        </label>

        <div className="mt-4">
          <div className="text-xs font-medium text-white/70">Цвет шерсти</div>
          <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FUR_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setFur(c.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 ring-1 transition ${fur === c.id ? "ring-cyan-400 bg-cyan-400/10" : "ring-white/10 hover:ring-white/30"}`}
              >
                <span className="h-7 w-7 rounded-full ring-2 ring-black/40" style={{ background: c.hex }} />
                <span className="text-[10px] text-white/70">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium text-white/70">Цвет глаз</div>
          <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EYE_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setEyes(c.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 ring-1 transition ${eyes === c.id ? "ring-cyan-400 bg-cyan-400/10" : "ring-white/10 hover:ring-white/30"}`}
              >
                <span className="h-7 w-7 rounded-full ring-2 ring-black/40" style={{ background: c.hex }} />
                <span className="text-[10px] text-white/70">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium text-white/70">Стартовая одежда</div>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {CLOTHING.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setClothing(c.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-3 ring-1 transition ${clothing === c.id ? "ring-cyan-400 bg-cyan-400/10" : "ring-white/10 hover:ring-white/30"}`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] text-white/70">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-400 px-4 py-3 font-['Press_Start_2P'] text-xs text-[#0a0e1a] shadow-[0_10px_30px_-10px_rgba(127,231,255,0.7)] transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Сохраняем..." : "НАЧАТЬ ИСТОРИЮ →"}
        </button>

        <button
          type="button"
          onClick={async () => {
            // Skip customization — just finish with existing profile
            const p = existingProfile ?? (await getCurrentProfile());
            if (p) finishWith(p);
          }}
          className="mt-2 w-full text-xs text-white/40 hover:text-white/70 transition py-2"
        >
          Пропустить
        </button>
      </form>
    </div>
  );
}
