// Пухлый рыжий котик в стиле "Бубу" — нарисован SVG, без фото.
// Большие зелёные глаза, белое пузико, полосатый хвост, розовый носик.

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
    <div
      className={className}
      style={{ width: px, height: px, display: "inline-block" }}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 120"
        width={px}
        height={px}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="furBody" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ffb066" />
            <stop offset="60%" stopColor="#f78c2a" />
            <stop offset="100%" stopColor="#d96a14" />
          </radialGradient>
          <radialGradient id="furHead" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#ffc07d" />
            <stop offset="70%" stopColor="#f89231" />
            <stop offset="100%" stopColor="#d56a14" />
          </radialGradient>
          <radialGradient id="belly" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#fff4d6" />
            <stop offset="100%" stopColor="#fbd89b" />
          </radialGradient>
          <radialGradient id="eye" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#b5ee5a" />
            <stop offset="60%" stopColor="#5fb524" />
            <stop offset="100%" stopColor="#2f7a10" />
          </radialGradient>
        </defs>

        {/* Тень */}
        <ellipse cx="60" cy="113" rx="32" ry="3.5" fill="rgba(0,0,0,0.28)" />

        {/* Хвост — полосатый, торчит влево */}
        <path
          d="M28 78 Q4 70 8 50 Q10 38 22 40 Q30 41 30 52 Q30 64 40 70 Z"
          fill="url(#furBody)"
          stroke="#7a3a08"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Полоски на хвосте */}
        <path d="M14 56 Q18 54 22 58" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M12 64 Q17 62 22 66" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M18 48 Q22 46 26 50" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Тело — пухлое грушевидное */}
        <ellipse cx="62" cy="82" rx="32" ry="26" fill="url(#furBody)" stroke="#7a3a08" strokeWidth="2.2" />
        {/* Белое пузико */}
        <ellipse cx="62" cy="86" rx="20" ry="18" fill="url(#belly)" />
        {/* Пупок */}
        <circle cx="62" cy="92" r="1.2" fill="#c98a3a" />

        {/* Передние лапки */}
        <ellipse cx="44" cy="78" rx="6" ry="9" transform="rotate(-25 44 78)" fill="url(#furBody)" stroke="#7a3a08" strokeWidth="2" />
        <ellipse cx="80" cy="98" rx="7" ry="5" fill="url(#furBody)" stroke="#7a3a08" strokeWidth="2" />
        {/* Задняя лапка */}
        <ellipse cx="46" cy="104" rx="9" ry="5" fill="url(#furBody)" stroke="#7a3a08" strokeWidth="2" />

        {/* Голова */}
        <circle cx="68" cy="48" r="32" fill="url(#furHead)" stroke="#7a3a08" strokeWidth="2.2" />

        {/* Ушки */}
        <path d="M44 28 L40 8 L58 22 Z" fill="url(#furHead)" stroke="#7a3a08" strokeWidth="2" strokeLinejoin="round" />
        <path d="M92 28 L96 8 L78 22 Z" fill="url(#furHead)" stroke="#7a3a08" strokeWidth="2" strokeLinejoin="round" />
        {/* Внутренние ушки */}
        <path d="M46 24 L44 14 L54 22 Z" fill="#ffb6c8" />
        <path d="M90 24 L92 14 L82 22 Z" fill="#ffb6c8" />

        {/* Полоски на лбу */}
        <path d="M58 18 Q60 12 62 18" stroke="#a84c10" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M68 16 Q70 10 72 16" stroke="#a84c10" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M78 18 Q80 12 82 18" stroke="#a84c10" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Полоски на щеках */}
        <path d="M42 44 Q46 46 48 44" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M40 50 Q44 52 48 50" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M88 44 Q92 46 94 44" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M88 50 Q92 52 96 50" stroke="#a84c10" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Бровки */}
        <path d="M50 38 Q56 34 62 38" stroke="#7a3a08" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M74 38 Q80 34 86 38" stroke="#7a3a08" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Глаза — большие круглые зелёные */}
        <circle cx="56" cy="50" r="10" fill="#ffffff" stroke="#3d2a10" strokeWidth="1.8" />
        <circle cx="80" cy="50" r="10" fill="#ffffff" stroke="#3d2a10" strokeWidth="1.8" />
        <circle cx="56" cy="50" r="8" fill="url(#eye)" />
        <circle cx="80" cy="50" r="8" fill="url(#eye)" />
        {/* Зрачки */}
        <ellipse cx="57" cy="51" rx="3" ry="5" fill="#0c1606" />
        <ellipse cx="81" cy="51" rx="3" ry="5" fill="#0c1606" />
        {/* Блики */}
        <circle cx="59" cy="48" r="2" fill="#ffffff" />
        <circle cx="83" cy="48" r="2" fill="#ffffff" />
        <circle cx="55" cy="53" r="1" fill="#ffffff" opacity="0.8" />
        <circle cx="79" cy="53" r="1" fill="#ffffff" opacity="0.8" />

        {/* Носик */}
        <path d="M66 62 L72 62 L69 66 Z" fill="#e07a93" stroke="#3d2a10" strokeWidth="1" strokeLinejoin="round" />
        {/* Ротик — улыбка с язычком */}
        <path d="M69 66 Q66 70 63 68" stroke="#3d2a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M69 66 Q72 72 76 70" stroke="#3d2a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Язычок */}
        <ellipse cx="74" cy="71" rx="2.5" ry="2" fill="#ff5a6e" stroke="#3d2a10" strokeWidth="0.8" />

        {/* Усики */}
        <line x1="34" y1="54" x2="48" y2="56" stroke="#3d2a10" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="34" y1="60" x2="48" y2="60" stroke="#3d2a10" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="102" y1="54" x2="88" y2="56" stroke="#3d2a10" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="102" y1="60" x2="88" y2="60" stroke="#3d2a10" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
    </div>
  );
}
