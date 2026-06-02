// Котик в стиле "Бубу" — пухлый серый кот с большими круглыми глазами,
// белым пузиком, маленькими ушками и розовым носиком.
// Один и тот же визуал используется для всех персонажей в игре.

type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, number> = {
  xs: 36,
  sm: 56,
  md: 80,
  lg: 110,
};

type Props = {
  size?: Size;
  className?: string;
};

export function CatSprite({ size = "md", className = "" }: Props) {
  const px = SIZES[size];
  return (
    <div
      className={`relative ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* Тень */}
        <ellipse cx="50" cy="94" rx="28" ry="3" fill="rgba(0,0,0,0.25)" />

        {/* Тело — пухлое, грушевидное */}
        <ellipse cx="50" cy="68" rx="32" ry="26" fill="#8a8f99" stroke="#3d4250" strokeWidth="2" />
        {/* Белое пузико */}
        <ellipse cx="50" cy="72" rx="20" ry="18" fill="#f3f1ec" />

        {/* Лапки нижние */}
        <ellipse cx="36" cy="90" rx="7" ry="4" fill="#8a8f99" stroke="#3d4250" strokeWidth="2" />
        <ellipse cx="64" cy="90" rx="7" ry="4" fill="#8a8f99" stroke="#3d4250" strokeWidth="2" />

        {/* Голова — большая круглая */}
        <circle cx="50" cy="40" r="28" fill="#9aa0aa" stroke="#3d4250" strokeWidth="2" />

        {/* Ушки */}
        <polygon points="28,22 24,6 40,16" fill="#9aa0aa" stroke="#3d4250" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="72,22 76,6 60,16" fill="#9aa0aa" stroke="#3d4250" strokeWidth="2" strokeLinejoin="round" />
        {/* Внутренние ушки */}
        <polygon points="30,20 28,12 36,17" fill="#f4b6c8" />
        <polygon points="70,20 72,12 64,17" fill="#f4b6c8" />

        {/* Щёчки белые */}
        <ellipse cx="50" cy="48" rx="18" ry="11" fill="#f3f1ec" />

        {/* Глаза — большие круглые */}
        <circle cx="40" cy="38" r="8" fill="#ffffff" stroke="#3d4250" strokeWidth="1.5" />
        <circle cx="60" cy="38" r="8" fill="#ffffff" stroke="#3d4250" strokeWidth="1.5" />
        {/* Зрачки */}
        <circle cx="41" cy="40" r="4" fill="#1a1d24" />
        <circle cx="61" cy="40" r="4" fill="#1a1d24" />
        {/* Блики */}
        <circle cx="42.5" cy="38.5" r="1.4" fill="#ffffff" />
        <circle cx="62.5" cy="38.5" r="1.4" fill="#ffffff" />

        {/* Носик */}
        <path d="M48 48 L52 48 L50 51 Z" fill="#e07a93" stroke="#3d4250" strokeWidth="0.8" strokeLinejoin="round" />
        {/* Ротик */}
        <path d="M50 51 Q47 55 44 53" stroke="#3d4250" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M50 51 Q53 55 56 53" stroke="#3d4250" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* Усики */}
        <line x1="22" y1="46" x2="34" y2="48" stroke="#3d4250" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="22" y1="50" x2="34" y2="50" stroke="#3d4250" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="78" y1="46" x2="66" y2="48" stroke="#3d4250" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="78" y1="50" x2="66" y2="50" stroke="#3d4250" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
