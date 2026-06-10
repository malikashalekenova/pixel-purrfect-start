// Котики в стиле "Бубу" — импортируем реальные PNG, чтобы Vite сам собрал пути.
import blackImg from "@/assets/bubu-black.png";
import creamImg from "@/assets/bubu-cream.png";
import noirImg from "@/assets/bubu-noir.png";
import noirNewImg from "@/assets/bubu-noir-v2.png";
import orangeImg from "@/assets/bubu-orange.png";

type Size = "xs" | "sm" | "md" | "lg";
type Variant = "cream" | "black" | "tomas" | "orange" | "noir" | "rex";

const SIZES: Record<Size, number> = {
  xs: 40,
  sm: 64,
  md: 96,
  lg: 140,
};

const SRC: Record<Variant, string> = {
  cream: creamImg,
  orange: orangeImg,
  black: blackImg,
  tomas: noirImg, // Томас теперь использует старую картинку Нуара
  noir: noirNewImg, // Нуар — новая картинка
  rex: orangeImg, // Рекс — старая картинка Томаса
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
