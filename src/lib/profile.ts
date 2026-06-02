import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  fur_color: string;
  eye_color: string;
  clothing: string;
  xp: number;
  level: number;
  coins: number;
  reputation: number;
  contracts_completed: number;
  total_earned: number;
  gang: string | null;
  gang_leader: boolean;
};

export const FUR_COLORS = [
  { id: "orange", label: "Рыжий", hex: "#fb923c" },
  { id: "cream", label: "Кремовый", hex: "#fde68a" },
  { id: "gray", label: "Серый", hex: "#94a3b8" },
  { id: "black", label: "Чёрный", hex: "#1f2937" },
] as const;

export const EYE_COLORS = [
  { id: "green", label: "Зелёные", hex: "#34d399" },
  { id: "blue", label: "Голубые", hex: "#60a5fa" },
  { id: "amber", label: "Янтарные", hex: "#fbbf24" },
  { id: "violet", label: "Фиолетовые", hex: "#a78bfa" },
] as const;

export const CLOTHING = [
  { id: "hoodie", label: "Тёмное худи", icon: "🧥" },
  { id: "jacket", label: "Кожанка", icon: "🦺" },
  { id: "sweater", label: "Свитер", icon: "👕" },
] as const;

// XP threshold per level: simple curve
export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 25)) + 1);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userRes.user.id)
    .maybeSingle();
  if (error) {
    console.error("[profile] load error", error);
    return null;
  }
  return data as Profile | null;
}

export async function updateMyProfile(
  patch: Partial<
    Pick<
      Profile,
      | "display_name"
      | "fur_color"
      | "eye_color"
      | "clothing"
      | "xp"
      | "level"
      | "coins"
      | "reputation"
      | "contracts_completed"
      | "total_earned"
      | "gang"
      | "gang_leader"
    >
  >,
): Promise<Profile | null> {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", userRes.user.id)
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("[profile] update error", error);
    return null;
  }
  return data as Profile | null;
}
