import { useState } from "react";
import { FUR_COLORS, EYE_COLORS, CLOTHING, type Profile } from "@/lib/profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


type Props = {
  profile: Profile;
  email: string | null;
  onClose: () => void;
};

export function ProfileWindow({ profile, email, onClose }: Props) {
  const [stage, setStage] = useState<"idle" | "askDelete" | "confirmDelete">("idle");
  const [working, setWorking] = useState(false);

  const handleSignOutOnly = async () => {
    setWorking(true);
    await supabase.auth.signOut();
    toast("Вы вышли из аккаунта.");
    setTimeout(() => window.location.reload(), 500);
  };

  const handleDelete = async () => {
    setWorking(true);
    try {
      await supabase.from("profiles").delete().eq("user_id", profile.user_id);
    } catch {
      // ignore — sign-out is the important part
    }
    await supabase.auth.signOut();
    toast("Профиль удалён. Можно войти под другим аккаунтом.");
    setTimeout(() => window.location.reload(), 600);
  };

  const fur = FUR_COLORS.find((c) => c.id === profile.fur_color);
  const eyes = EYE_COLORS.find((c) => c.id === profile.eye_color);
  const clothing = CLOTHING.find((c) => c.id === profile.clothing);

  const rows: [string, React.ReactNode][] = [
    ["ID игрока", <span className="font-mono text-[10px] text-white/40">{profile.user_id.slice(0, 8)}...</span>],
    ["Email", email ?? <span className="text-white/40">Гость / не найден</span>],
    ["Имя", profile.display_name ?? profile.username],
    ["Цвет шерсти", <span className="inline-flex items-center gap-2">{fur && <span className="h-3 w-3 rounded-full ring-1 ring-white/30" style={{ background: fur.hex }} />}{fur?.label ?? profile.fur_color}</span>],
    ["Цвет глаз", <span className="inline-flex items-center gap-2">{eyes && <span className="h-3 w-3 rounded-full ring-1 ring-white/30" style={{ background: eyes.hex }} />}{eyes?.label ?? profile.eye_color}</span>],
    ["Одежда", `${clothing?.icon ?? ""} ${clothing?.label ?? profile.clothing}`],
    ["Монеты", <span className="text-amber-300">🪙 {profile.coins}</span>],
    ["Репутация", profile.reputation],
    ["Уровень", <span className="text-cyan-300">{profile.level}</span>],
    ["Опыт", <span className="text-cyan-300">✦ {profile.xp}</span>],
    ["Выполнено контрактов", profile.contracts_completed],
    ["Заработано всего", <span className="text-amber-300">🪙 {profile.total_earned}</span>],
    ["Банда", profile.gang ?? <span className="text-white/40">Нет</span>],
    ["Лидер банды", profile.gang_leader ? "Да" : <span className="text-white/40">Нет</span>],
  ];

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#0a0f1a] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
              Профиль
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {profile.display_name ?? profile.username}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value], i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-xs uppercase tracking-wider text-white/40">
                    {label}
                  </td>
                  <td className="py-2 text-right text-white/90">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sign out / delete account */}
        <div className="border-t border-white/10 px-5 py-4">
          {stage === "idle" && (
            <button
              type="button"
              onClick={() => setStage("askDelete")}
              disabled={working}
              className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20 hover:text-white disabled:opacity-50"
            >
              ↪ Выйти из аккаунта
            </button>
          )}

          {stage === "askDelete" && (
            <div className="space-y-3">
              <p className="text-center text-xs text-white/70">
                Удалить также профиль перед выходом? Другой игрок сможет начать с чистого листа.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSignOutOnly}
                  disabled={working}
                  className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
                >
                  {working ? "Выхожу..." : "Нет, просто выйти"}
                </button>
                <button
                  type="button"
                  onClick={() => setStage("confirmDelete")}
                  disabled={working}
                  className="flex-1 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-100 disabled:opacity-50"
                >
                  🗑 Удалить профиль
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStage("idle")}
                disabled={working}
                className="w-full text-center text-[11px] text-white/40 hover:text-white/70 disabled:opacity-50"
              >
                Отмена
              </button>
            </div>
          )}

          {stage === "confirmDelete" && (
            <div className="space-y-2">
              <p className="text-center text-xs text-white/70">
                Профиль будет удалён безвозвратно. Подтвердить?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStage("askDelete")}
                  disabled={working}
                  className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5 disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={working}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {working ? "Удаляю..." : "Да, удалить"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
