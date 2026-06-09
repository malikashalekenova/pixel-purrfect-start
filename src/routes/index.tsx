import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import bg from "@/assets/shadow-district-bg.png";
import { Desktop } from "@/components/Desktop";
import { GameIntro } from "@/components/GameIntro";
import { Workshop } from "@/components/Workshop";
import { Street } from "@/components/Street";
import { Room } from "@/components/Room";
import { Leaderboard } from "@/components/Leaderboard";
import { CharacterCreation } from "@/components/CharacterCreation";
import { ProfileWindow } from "@/components/ProfileWindow";
import { ShopWindow, type ShopItem } from "@/components/ShopWindow";
import { AIAdvisorWindow } from "@/components/AIAdvisorWindow";
import { AdminPanel } from "@/components/AdminPanel";
import { VitalsHUD, modVitals, setVitals, FULL_VITALS } from "@/components/VitalsHUD";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  ensureCurrentProfile,
  getCurrentProfile,
  levelFromXp,
  updateMyProfile,
  type Profile,
} from "@/lib/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shadow District" },
      {
        name: "description",
        content:
          "Shadow District — a pixel art story game about chasing success from a tiny dirty room in the slums.",
      },
      { property: "og:title", content: "Shadow District" },
      {
        property: "og:description",
        content: "A pixel art story game. Start your journey from the shadows.",
      },
    ],
  }),
  component: Index,
});

type Stage =
  | "menu"
  | "intro"
  | "zooming"
  | "desktop"
  | "mission"
  | "workshop"
  | "done"
  | "room-after"
  | "street";

function Index() {
  const [stage, setStage] = useState<Stage>("menu");
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [purchases, setPurchases] = useState<ShopItem[]>([]);
  const [crashed, setCrashed] = useState(false);

  const isHome =
    stage === "desktop" ||
    stage === "mission" ||
    stage === "workshop" ||
    stage === "done" ||
    stage === "room-after";
  const isStreet = stage === "street";
  const showVitals = isHome || isStreet;

  const handleBuy = async (item: ShopItem) => {
    const newCoins = coins - item.price;
    setCoins(newCoins);
    setPurchases((prev) => [...prev, item]);
    toast(`Куплено: ${item.name}`, { description: `−${item.price} монет` });

    // Apply item effect on vitals (30% rule items)
    const n = item.name.toLowerCase();
    if (n.includes("анти") || n.includes("патч")) modVitals({ stability: 25 });
    else if (n.includes("защит") || n.includes("firewall") || n.includes("shield"))
      modVitals({ health: 20, stability: 10 });
    else if (
      n.includes("энерг") ||
      n.includes("energy") ||
      n.includes("coffee") ||
      n.includes("кофе")
    )
      modVitals({ energy: 40 });
    else if (n.includes("резерв")) modVitals({ health: 30 });
    else modVitals({ stability: 10 });

    if (profile) {
      const updated = await updateMyProfile({ coins: newCoins });
      if (updated) setProfile(updated);
    }
  };

  // Load profile on mount + on auth changes (autosave / login restore)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;
    const loadProfile = async () => {
      const [{ data: userRes }, p] = await Promise.all([
        supabase.auth.getUser(),
        ensureCurrentProfile().then((profile) => profile ?? getCurrentProfile()),
      ]);
      if (!active) return;
      setAuthEmail(userRes.user?.email ?? null);
      if (p) {
        setProfile(p);
        setCoins(p.coins);
        setXp(p.xp);
      } else {
        setProfile(null);
      }
    };

    loadProfile();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handlePlay = () => {
    setStage("intro");
  };

  const handleIntroFinish = () => {
    setStage("desktop");
  };

  const handleStartMission = () => {
    setStage("mission");
    toast("Контракт принят. Направляйся в мастерскую.", {
      description: "Соседняя улица · NPC-механик ждёт.",
    });
    setTimeout(() => setStage("workshop"), 2200);
  };

  const handleWorkshopComplete = async () => {
    const newCoins = coins + 50;
    const newXp = xp + 25;
    setCoins(newCoins);
    setXp(newXp);
    setStage("room-after");
    toast("Контракт выполнен!", {
      description: "+50 монет · +25 опыта",
    });
    // Autosave (only if registered)
    if (profile) {
      const newLevel = levelFromXp(newXp);
      const updated = await updateMyProfile({
        coins: newCoins,
        xp: newXp,
        total_earned: profile.total_earned + 50,
        contracts_completed: profile.contracts_completed + 1,
        level: newLevel,
      });
      if (updated) {
        setProfile(updated);
        if (newLevel > profile.level) {
          toast(`Новый уровень: ${newLevel}!`, { description: "Прогресс сохранён." });
        }
      }
    }
  };

  const handleLeaveRoom = () => {
    setStage("street");
  };

  const handleCommunicate = async (xpGain: number) => {
    const newXp = xp + xpGain;
    setXp(newXp);
    if (profile) {
      const newLevel = levelFromXp(newXp);
      const updated = await updateMyProfile({
        xp: newXp,
        level: newLevel,
      });
      if (updated) setProfile(updated);
    }
  };

  const handleDiscoverCafe = () => {
    // marker added to city map (future feature)
  };

  const handleProfileCreated = (p: Profile) => {
    setProfile(p);
    setCoins(p.coins);
    setXp(p.xp);
    toast("Прогресс будет сохраняться автоматически.");
  };

  // Monitor approximate center in the background image (percent of image)
  // From the generated bg: monitor sits ~58% from left, ~46% from top.
  const monitorOrigin = "58% 46%";
  const zoomScale = stage === "menu" ? 1 : 8;

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* Background that zooms into the monitor */}
      <img
        src={bg}
        alt="Pixel art cat in hoodie sitting at an old computer in a dirty apartment"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-in-out"
        style={{
          imageRendering: "pixelated",
          transformOrigin: monitorOrigin,
          transform: `scale(${zoomScale})`,
        }}
      />

      {/* Vignette only in menu */}
      {stage === "menu" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
        </>
      )}

      {/* Fade-to-black during zoom transition */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-1000"
        style={{
          opacity: stage === "zooming" ? 0.85 : 0,
          transitionDelay: stage === "zooming" ? "1200ms" : "0ms",
        }}
      />

      {/* Title + Play button (menu only) */}
      {stage === "menu" && (
        <>
          <div className="relative z-10 flex w-full flex-col items-center px-6 pt-10 sm:pt-16">
            <h1
              className="text-center font-['Press_Start_2P'] text-4xl leading-tight tracking-tight text-[#7fe7ff] sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                textShadow:
                  "0 0 12px rgba(127,231,255,0.55), 4px 4px 0 #0a1a26, 8px 8px 0 rgba(0,0,0,0.6)",
              }}
            >
              SHADOW
              <br />
              DISTRICT
            </h1>
          </div>

          <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 sm:bottom-24">
            <button
              type="button"
              onClick={handlePlay}
              className="font-['Press_Start_2P'] text-xl sm:text-2xl text-[#0a1016] bg-[#7fe7ff] px-10 py-5 border-4 border-[#0a1016] shadow-[6px_6px_0_0_#0a1016] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_0_#0a1016] hover:bg-[#a8f1ff]"
            >
              ИГРАТЬ
            </button>
          </div>
        </>
      )}

      {/* AI-generated intro before game starts */}
      {stage === "intro" && <GameIntro onFinish={handleIntroFinish} />}

      {/* Desktop OS appears after zoom */}
      {(stage === "desktop" || stage === "mission" || stage === "done") && (
        <Desktop
          onStartMission={handleStartMission}
          onOpenShop={() => setShopOpen(true)}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAIAdvisor={() => setAiAdvisorOpen(true)}
          hasProfile={!!profile}
        />
      )}

      {/* Mission travel overlay */}
      {stage === "mission" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 animate-fade-in">
          <div className="max-w-md px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
              Глава 1 · В пути
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Мастерская на соседней улице
            </h2>
            <p className="mt-4 text-sm text-white/60">Загрузка локации...</p>
          </div>
        </div>
      )}

      {/* Workshop minigame */}
      {stage === "workshop" && <Workshop onComplete={handleWorkshopComplete} />}

      {/* Room scene — after first contract, before going outside */}
      {stage === "room-after" && (
        <Room
          onExit={handleLeaveRoom}
          onRestart={() => window.location.reload()}
          onLoad={() => window.location.reload()}
        />
      )}

      {/* Street scene after first contract */}
      {stage === "street" && (
        <Street
          onCommunicate={handleCommunicate}
          onDiscoverCafe={handleDiscoverCafe}
          hasProfile={!!profile}
          onProfileCreated={handleProfileCreated}
          coins={coins}
          onSpend={(amount) => {
            if (coins < amount) return false;
            const newCoins = coins - amount;
            setCoins(newCoins);
            if (profile) {
              updateMyProfile({ coins: newCoins }).then((u) => u && setProfile(u));
            }
            return true;
          }}
        />
      )}

      {/* HUD: coins / xp */}
      {(stage === "desktop" ||
        stage === "mission" ||
        stage === "workshop" ||
        stage === "done" ||
        stage === "room-after" ||
        stage === "street") && (
        <div className="pointer-events-none absolute right-3 top-3 z-[60] flex items-center gap-2 text-xs">
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-amber-300 ring-1 ring-white/10 backdrop-blur">
            🪙 {coins}
          </span>
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-cyan-300 ring-1 ring-white/10 backdrop-blur">
            ✦ {xp} XP
          </span>
        </div>
      )}

      {/* Leaderboard + Profile + Shop triggers — only outside the computer */}
      {(stage === "room-after" || stage === "street") && (
        <div className="absolute left-3 top-3 z-[60] flex gap-2">
          <button
            type="button"
            onClick={() => setLeaderboardOpen(true)}
            className="rounded-full bg-black/60 px-3 py-1.5 text-xs text-cyan-200 ring-1 ring-cyan-400/30 backdrop-blur hover:bg-cyan-400/10 hover:text-cyan-100 transition"
          >
            🏆 Рейтинг
          </button>
          {profile && (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="rounded-full bg-black/60 px-3 py-1.5 text-xs text-amber-200 ring-1 ring-amber-400/30 backdrop-blur hover:bg-amber-400/10 hover:text-amber-100 transition"
            >
              👤 Профиль
            </button>
          )}
        </div>
      )}

      {profile && profileOpen && (
        <ProfileWindow
          profile={profile}
          email={authEmail}
          onClose={() => setProfileOpen(false)}
        />
      )}

      <ShopWindow
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        coins={coins}
        onBuy={handleBuy}
        purchaseCount={purchases.length}
      />

      <Leaderboard open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />

      {aiAdvisorOpen && (
        <AIAdvisorWindow
          profile={profile}
          coins={coins}
          xp={xp}
          stage={stage}
          onClose={() => setAiAdvisorOpen(false)}
        />
      )}

      <AdminPanel
        stage={stage}
        onSkipIntro={handleIntroFinish}
        onSkipWorkshop={handleWorkshopComplete}
        onJump={(s) => {
          setCrashed(false);
          setStage(s);
        }}
        onAddCoins={(n) => setCoins((c) => c + n)}
        onAddXp={(n) => setXp((x) => x + n)}
      />

      {/* Global CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-15 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
        }}
      />

      {/* Vitals HUD — правило 30% */}
      {showVitals && !crashed && (
        <VitalsHUD
          location={isStreet ? "street" : "home"}
          paused={shopOpen || profileOpen || leaderboardOpen}
          onCrash={() => setCrashed(true)}
        />
      )}

      {/* System crash overlay */}
      {crashed && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black text-center font-mono text-red-400">
          <div className="text-xs uppercase tracking-[0.4em] text-red-500/80">system failure</div>
          <h2 className="text-2xl sm:text-4xl">⚠ ПРОЦЕСС КОТИКА СЛОМАН</h2>
          <p className="max-w-md text-sm text-red-300/70">
            Один из показателей упал до 0%. Поведение нестабилизировано. Перезапустите процесс.
          </p>
          <button
            type="button"
            onClick={() => {
              setVitals(FULL_VITALS);
              setCrashed(false);
              window.location.reload();
            }}
            className="mt-4 border-2 border-red-500 px-6 py-2 text-red-300 hover:bg-red-500/10"
          >
            ПЕРЕЗАПУСТИТЬ
          </button>
        </div>
      )}

      {/* Registration gate — shown from the very start until the user finishes character creation */}
      {!profile && <CharacterCreation onCreated={handleProfileCreated} />}
    </main>
  );
}
