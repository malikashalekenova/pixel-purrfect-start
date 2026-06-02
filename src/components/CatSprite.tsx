// Котики в стиле "Бубу" — рыжий (по умолчанию) и чёрный злой.
import orangeAsset from "@/assets/bubu-orange.png.asset.json";
import blackAsset from "@/assets/bubu-black.png.asset.json";

type Size = "xs" | "sm" | "md" | "lg";
type Variant = "orange" | "black";

const SIZES: Record<Size, number> = {
  xs: 40,
  sm: 64,
  md: 96,
  lg: 140,
};

const SRC: Record<Variant, string> = {
  orange: orangeAsset.url,
  black: blackAsset.url,
};

type Props = {
  size?: Size;
  variant?: Variant;
  className?: string;
};

export function CatSprite({ size = "md", variant = "orange", className = "" }: Props) {
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
