import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  username: string;
  xp: number;
  contracts_completed: number;
  total_earned: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

type SortKey = "xp" | "contracts_completed" | "total_earned";

export function Leaderboard({ open, onClose }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("xp");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setErr(null);
    (supabase as any)
      .from("leaderboard")
      .select("id, username, xp, contracts_completed, total_earned")
      .order(sortBy, { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setErr(error.message);
        else setRows((data ?? []) as Row[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, sortBy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-400/20 bg-[#0a0f1a] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
              Shadow District
            </p>
            <h2 className="mt-1 text-xl font-semibold">🏆 Мировой рейтинг</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 px-5 py-3 border-b border-white/5">
          {([
            ["xp", "По опыту ✦"],
            ["contracts_completed", "По контрактам 📄"],
            ["total_earned", "По заработку 🪙"],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`rounded-full px-3 py-1 text-xs ring-1 transition ${
                sortBy === key
                  ? "bg-cyan-400/20 text-cyan-200 ring-cyan-400/40"
                  : "bg-white/5 text-white/60 ring-white/10 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {loading && (
            <p className="px-4 py-8 text-center text-sm text-white/50">Загрузка...</p>
          )}
          {err && (
            <p className="px-4 py-8 text-center text-sm text-red-400">{err}</p>
          )}
          {!loading && !err && rows.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-white/50">
              Пока нет игроков. Стань первым!
            </p>
          )}
          {!loading && rows.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Игрок</th>
                  <th className="px-3 py-2 text-right">Опыт</th>
                  <th className="px-3 py-2 text-right">Контракты</th>
                  <th className="px-3 py-2 text-right">Заработано</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-white/5 hover:bg-white/5"
                    >
                      <td className="px-3 py-2 text-white/50">
                        {medal ?? i + 1}
                      </td>
                      <td className="px-3 py-2 font-medium">{r.username}</td>
                      <td className="px-3 py-2 text-right text-cyan-300">
                        ✦ {r.xp}
                      </td>
                      <td className="px-3 py-2 text-right text-white/80">
                        {r.contracts_completed}
                      </td>
                      <td className="px-3 py-2 text-right text-amber-300">
                        🪙 {r.total_earned}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
