// Unified pixel cat — кремовый котик в большом жёлтом свитере.
// Один и тот же визуал используется для главного героя и всех NPC.

type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, { w: number; h: number }> = {
  xs: { w: 32, h: 40 },
  sm: { w: 48, h: 60 },
  md: { w: 64, h: 80 },
  lg: { w: 80, h: 100 },
};

type Props = {
  size?: Size;
  className?: string;
};

export function CatSprite({ size = "md", className = "" }: Props) {
  const { w, h } = SIZES[size];
  // Все позиции считаются от базового 64x80, масштабируем через transform
  const scale = w / 64;
  return (
    <div
      className={`relative ${className}`}
      style={{ width: w, height: h, imageRendering: "pixelated" }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 64,
          height: 80,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Head (cream) */}
        <div className="absolute left-1/2 top-0 h-8 w-10 -translate-x-1/2 rounded-sm bg-amber-100 ring-2 ring-amber-300" />
        {/* Fluffy ears */}
        <div className="absolute left-0 top-0 h-3 w-3 -rotate-12 bg-amber-100 ring-1 ring-amber-300" />
        <div className="absolute right-0 top-0 h-3 w-3 rotate-12 bg-amber-100 ring-1 ring-amber-300" />
        {/* Inner ears */}
        <div className="absolute left-1 top-1 h-1.5 w-1.5 bg-pink-300" />
        <div className="absolute right-1 top-1 h-1.5 w-1.5 bg-pink-300" />
        {/* Eyes */}
        <div className="absolute left-3 top-3 h-1.5 w-1.5 bg-sky-700" />
        <div className="absolute right-3 top-3 h-1.5 w-1.5 bg-sky-700" />
        {/* Nose */}
        <div className="absolute left-1/2 top-5 h-1 w-1 -translate-x-1/2 bg-pink-400" />
        {/* Big yellow sweater */}
        <div className="absolute left-1/2 top-7 h-11 w-14 -translate-x-1/2 rounded-md bg-yellow-300 ring-2 ring-yellow-600" />
        {/* Sweater pattern */}
        <div className="absolute left-1/2 top-9 h-1 w-10 -translate-x-1/2 bg-yellow-500/60" />
        <div className="absolute left-1/2 top-12 h-1 w-10 -translate-x-1/2 bg-yellow-500/60" />
        {/* Waving paw */}
        <div className="absolute -right-1 top-8 h-3 w-3 rotate-12 bg-amber-100 ring-1 ring-amber-300" />
        {/* Legs */}
        <div className="absolute left-3 bottom-0 h-3 w-2.5 bg-amber-100 ring-1 ring-amber-300" />
        <div className="absolute right-3 bottom-0 h-3 w-2.5 bg-amber-100 ring-1 ring-amber-300" />
      </div>
    </div>
  );
}
