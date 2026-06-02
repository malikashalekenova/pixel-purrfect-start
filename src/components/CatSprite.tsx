import bubuAsset from "@/assets/bubu-cat.png.asset.json";

type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, number> = {
  xs: 40,
  sm: 64,
  md: 96,
  lg: 140,
};

type Props = {
  size?: Size;
  className?: string;
};

export function CatSprite({ size = "md", className = "" }: Props) {
  const px = SIZES[size];
  return (
    <img
      src={bubuAsset.url}
      alt="Котик"
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px, objectFit: "contain", display: "block" }}
      draggable={false}
    />
  );
}
