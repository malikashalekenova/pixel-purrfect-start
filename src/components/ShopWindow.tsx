import { useEffect, useMemo, useState } from "react";

type Category = "stability" | "energy" | "defense" | "glitch" | "risky";

type ShopItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: Category;
  icon: string;
  tag?: string; // small label e.g. "одноразово"
};

const CATEGORIES: { id: Category; label: string; glyph: string; color: string }[] = [
  { id: "stability", label: "Стабильность", glyph: "🧠", color: "#7fe7ff" },
  { id: "energy",    label: "Энергия",      glyph: "⚡", color: "#fbbf24" },
  { id: "defense",   label: "Защита",       glyph: "🔧", color: "#34d399" },
  { id: "glitch",    label: "Глюки",        glyph: "🧩", color: "#a78bfa" },
  { id: "risky",     label: "Риск",         glyph: "💀", color: "#f87171" },
];

const BASE_ITEMS: ShopItem[] = [
  // Stability
  { id: "anti-crash",   name: "Anti-Crash Patch",   desc: "+10% стабильности при падении. Снижает риск критического сбоя.", price: 50,  category: "stability", icon: "🩹" },
  { id: "backup",       name: "Backup Process",     desc: "Автоматически спасает при 0%. Одноразовое восстановление.",       price: 120, category: "stability", icon: "💾", tag: "одноразово" },
  { id: "shield-layer", name: "Защитный слой",      desc: "Замедляет падение показателей состояния.",                        price: 90,  category: "stability", icon: "🧬" },
  // Energy
  { id: "energy-pack",  name: "Energy Pack",        desc: "Восстанавливает 30% энергии.",                                    price: 40,  category: "energy", icon: "🔋" },
  { id: "coffee",       name: "System Coffee",      desc: "+скорость движения. Стабильность падает быстрее.",                price: 60,  category: "energy", icon: "☕" },
  { id: "overload",     name: "Перегрузка",         desc: "Временно +100% скорость, затем усталость.",                       price: 80,  category: "energy", icon: "🔄" },
  // Defense
  { id: "firewall",     name: "Firewall Cat",       desc: "Защита от вирусных зон в городе.",                                price: 100, category: "defense", icon: "🧱" },
  { id: "pawshield",    name: "PawShield Antivirus",desc: "Удаляет заражённые эффекты с персонажа.",                         price: 110, category: "defense", icon: "🧿" },
  { id: "stabilizer",   name: "Стабилизационный модуль", desc: "Уменьшает лаги и дрожание экрана.",                          price: 70,  category: "defense", icon: "🛡️" },
  // Glitch
  { id: "glitch-map",   name: "Glitch Map",         desc: "Открывает скрытые уровни города.",                                price: 150, category: "glitch", icon: "🌀" },
  { id: "broken-vision",name: "Broken Vision",      desc: "Показывает невидимые платформы. Иногда врёт.",                    price: 130, category: "glitch", icon: "👁" },
  { id: "twin-cat",     name: "Двойной котик",      desc: "Создаёт копию персонажа (иллюзия). Можно использовать как щит.",   price: 200, category: "glitch", icon: "🐾" },
  // Risky
  { id: "disable-30",   name: "Отключить 30% лимит",desc: "Убирает предупреждение системы. Мир становится нестабильным.",    price: 300, category: "risky", icon: "❗" },
  { id: "unlock-core",  name: "Разблокировка ядра", desc: "Доступ к финальным уровням раньше времени.",                      price: 400, category: "risky", icon: "❗" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  coins: number;
  onBuy: (item: ShopItem) => void;
  /** how many purchases the player has made so far — drives shop corruption */
  purchaseCount: number;
};

function corruptItem(item: ShopItem, seed: number): ShopItem {
  // pseudo-stable per-item corruption
  const h = (item.id.charCodeAt(0) + seed) % 7;
  if (h === 0) {
    return {
      ...item,
      name: "UNKNOWN FILE",
      desc: "ЭТОТ ПРЕДМЕТ НЕ ДОЛЖЕН БЫТЬ ДОСТУПЕН",
      icon: "❓",
      price: Math.max(1, item.price + ((seed * 13) % 80) - 40),
      tag: "???",
    };
  }
  if (h === 1) {
    // price drift
    const drift = ((item.id.length * 7 + seed) % 50) - 20;
    return { ...item, price: Math.max(1, item.price + drift) };
  }
  return item;
}

export function ShopWindow({ open, onClose, coins, onBuy, purchaseCount }: Props) {
  const [tab, setTab] = useState<Category>("stability");
  const [flash, setFlash] = useState<string | null>(null);
  const [glitchTick, setGlitchTick] = useState(0);

  // Corruption ramps up with purchase count
  const corruptionLevel = Math.min(4, Math.floor(purchaseCount / 2));

  // Light screen-glitch effect for the shop
  useEffect(() => {
    if (!open || corruptionLevel === 0) return;
    const id = setInterval(
      () => setGlitchTick((t) => t + 1),
      Math.max(600, 1800 - corruptionLevel * 300),
    );
    return () => clearInterval(id);
  }, [open, corruptionLevel]);

  const items = useMemo(() => {
    if (corruptionLevel === 0) return BASE_ITEMS;
    return BASE_ITEMS.map((it) => corruptItem(it, purchaseCount + glitchTick * 3));
  }, [corruptionLevel, purchaseCount, glitchTick]);

  const visibleItems = items.filter((i) => i.category === tab);

  if (!open) return null;

  function tryBuy(item: ShopItem) {
    if (item.name === "UNKNOWN FILE") {
      setFlash("⚠ ЭТОТ ПРЕДМЕТ НЕ ДОЛЖЕН БЫТЬ ДОСТУПЕН");
      setTimeout(() => setFlash(null), 1600);
      return;
    }
    if (coins < item.price) {
      setFlash("Недостаточно DATA-COINS.");
      setTimeout(() => setFlash(null), 1400);
      return;
    }
    onBuy(item);
    setFlash(`✓ ${item.name} приобретён`);
    setTimeout(() => setFlash(null), 1400);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-lg border-2 border-cyan-400/60 text-slate-100"
        style={{
          background:
            "linear-gradient(160deg, rgba(8,12,30,0.97), rgba(4,6,18,0.97))",
          boxShadow: "0 30px 80px -10px rgba(127,231,255,0.35), inset 0 0 0 1px rgba(127,231,255,0.15)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          transform: corruptionLevel >= 2 && glitchTick % 4 === 0 ? "translateX(1px)" : "none",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-cyan-400/30 bg-black/40 px-4 py-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#7fe7ff]" />
            [SYSTEM SHOP v1.0]
            {corruptionLevel >= 3 && (
              <span className="ml-2 text-rose-400 animate-pulse">v???</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Header line */}
        <div className="border-b border-cyan-400/20 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">
            «Улучшения процесса котика»
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Кошелёк:{" "}
              <span className="font-bold text-amber-300">{coins} DC</span>
              <span className="ml-2 text-[10px] text-slate-500">DATA-COINS</span>
            </span>
            {corruptionLevel >= 1 && (
              <span className="text-[10px] uppercase tracking-widest text-rose-400/80">
                {"// аномалии: " + corruptionLevel}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-cyan-400/20 bg-black/30 px-2 py-2">
          {CATEGORIES.map((c) => {
            const active = tab === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab(c.id)}
                className="rounded px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition"
                style={{
                  background: active ? c.color + "22" : "transparent",
                  color: active ? c.color : "#94a3b8",
                  boxShadow: active ? `inset 0 0 0 1px ${c.color}66` : "none",
                }}
              >
                <span className="mr-1">{c.glyph}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Item list */}
        <div className="max-h-[55vh] overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-2">
            {visibleItems.map((item) => {
              const corrupted = item.name === "UNKNOWN FILE";
              const canAfford = coins >= item.price && !corrupted;
              return (
                <li
                  key={item.id}
                  className="group flex items-start gap-3 rounded border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]"
                  style={{
                    boxShadow: corrupted
                      ? "inset 0 0 0 1px rgba(244,63,94,0.4)"
                      : "none",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-xl"
                    style={{
                      background: "linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                      filter: corrupted ? "hue-rotate(180deg) saturate(2)" : "none",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-bold ${
                          corrupted ? "text-rose-300" : "text-slate-100"
                        }`}
                        style={
                          corrupted
                            ? { textShadow: "1px 0 #f43f5e, -1px 0 #06b6d4" }
                            : undefined
                        }
                      >
                        {item.name}
                      </span>
                      {item.tag && (
                        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-amber-300 ring-1 ring-amber-400/30">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-slate-400">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-amber-300">
                      {item.price} <span className="text-[10px] text-amber-300/70">DC</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => tryBuy(item)}
                      disabled={!canAfford}
                      className="rounded border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        borderColor: corrupted
                          ? "rgba(244,63,94,0.5)"
                          : "rgba(127,231,255,0.4)",
                        color: corrupted ? "#fda4af" : "#7fe7ff",
                        background: corrupted
                          ? "rgba(244,63,94,0.08)"
                          : "rgba(127,231,255,0.06)",
                      }}
                    >
                      {corrupted ? "?_?" : "Купить"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer flash */}
        <div className="border-t border-cyan-400/20 bg-black/40 px-4 py-2 text-[11px] text-slate-400 min-h-[2rem] flex items-center">
          {flash ? (
            <span
              className={
                flash.startsWith("✓")
                  ? "text-emerald-300"
                  : flash.startsWith("⚠")
                  ? "text-rose-400 animate-pulse"
                  : "text-amber-300"
              }
            >
              {flash}
            </span>
          ) : (
            <span className="text-slate-500">
              {corruptionLevel >= 4
                ? "// SYSTEM: магазин компрометирован."
                : corruptionLevel >= 2
                ? "// SYSTEM: обнаружены аномалии в каталоге."
                : "// готов к покупке."}
            </span>
          )}
        </div>

        {/* Scanlines overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
          }}
        />
      </div>
    </div>
  );
}

export type { ShopItem };
