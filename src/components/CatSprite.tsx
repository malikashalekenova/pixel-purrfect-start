// Котики в стиле "Бубу" — кремовый, чёрный злой, и Томас (фото).
import creamAsset from "@/assets/bubu-cream.png.asset.json";
import blackAsset from "@/assets/bubu-black.png.asset.json";
import tomasAsset from "@/assets/bubu-tomas.png.asset.json";
import noirAsset from "@/assets/bubu-noir.png.asset.json";
import noirNewAsset from "@/assets/bubu-noir-v2.png.asset.json";

type Size = "xs" | "sm" | "md" | "lg";
type Variant = "cream" | "black" | "tomas" | "orange" | "noir" | "rex";

const SIZES: Record<Size, number> = {
  xs: 40,
  sm: 64,
  md: 96,
  lg: 140,
};

const SRC: Record<Variant, string> = {
  cream: creamAsset.url,
  orange: creamAsset.url, // legacy alias
  black: blackAsset.url,
  tomas: noirAsset.url, // Томас теперь использует старую картинку Нуара
  noir: noirNewAsset.url, // Нуар — новая картинка
  rex: tomasAsset.url, // Рекс — старая картинка Томаса
};

type Props = {
  size?: Size;
  variant?: Variant;
  className?: string;
};

export function CatSprite({ size = "md", variant = "cream", className = "" }: Props) {
  const px = SIZES[size];
  return (
    <img
      src={SRC[variant]}
      alt=""
      aria-hidden
      className={className}
      style={{
        width: px,
        height: px,
        objectFit: "contain",
        display: "inline-block",
        userSelect: "none",
        pointerEvents: "none",
      }}
      draggable={false}
    />
  );
}
