import { clsx } from 'clsx';

interface MindMateMascotProps {
  size?: 'sm' | 'md' | 'lg';
  expression?: 'happy' | 'wave' | 'think' | 'celebrate';
  className?: string;
}

export function MindMateMascot({
  size = 'md',
  expression = 'happy',
  className,
}: MindMateMascotProps) {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  return (
    <div className={clsx('relative', sizeMap[size], className)}>
      {/* Glow ring behind mascot */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 opacity-50 animate-pulse-slow blur-xl" />

      {/* Main mascot body */}
      <svg
        viewBox="0 0 120 120"
        className={clsx(
          'relative z-10 drop-shadow-lg',
          expression === 'wave' && 'animate-wiggle',
          expression === 'celebrate' && 'animate-pop',
        )}
      >
        {/* Body - rounded blob shape */}
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <radialGradient id="cheekGrad">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#000" opacity="0.08" />

        {/* Body */}
        <ellipse cx="60" cy="68" rx="34" ry="36" fill="url(#bodyGrad)" />

        {/* Belly highlight */}
        <ellipse cx="60" cy="74" rx="22" ry="22" fill="white" opacity="0.15" />

        {/* Sprout on top */}
        <g className={expression === 'celebrate' ? 'animate-wave-hand' : ''}>
          <path
            d="M60 32 C58 22, 50 14, 42 18 C50 20, 54 26, 56 32"
            fill="url(#leafGrad)"
            stroke="#059669"
            strokeWidth="0.5"
          />
          <path
            d="M60 32 C62 22, 70 14, 78 18 C70 20, 66 26, 64 32"
            fill="url(#leafGrad)"
            stroke="#059669"
            strokeWidth="0.5"
          />
          <line x1="60" y1="32" x2="60" y2="38" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Eyes */}
        {expression === 'happy' || expression === 'wave' ? (
          <>
            {/* Happy eyes - curved lines */}
            <path d="M46 60 Q50 55, 54 60" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M66 60 Q70 55, 74 60" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : expression === 'think' ? (
          <>
            {/* Thinking eyes - dots */}
            <circle cx="50" cy="58" r="3" fill="#0c4a6e" />
            <circle cx="70" cy="58" r="3" fill="#0c4a6e" />
            {/* Thinking dots */}
            <circle cx="88" cy="45" r="2.5" fill="#94a3b8" opacity="0.6" />
            <circle cx="94" cy="38" r="3.5" fill="#94a3b8" opacity="0.4" />
          </>
        ) : (
          <>
            {/* Celebrate eyes - stars */}
            <text x="44" y="63" fontSize="10" fill="#0c4a6e" fontFamily="system-ui">
              ★
            </text>
            <text x="64" y="63" fontSize="10" fill="#0c4a6e" fontFamily="system-ui">
              ★
            </text>
          </>
        )}

        {/* Blush cheeks */}
        <circle cx="40" cy="68" r="6" fill="url(#cheekGrad)" />
        <circle cx="80" cy="68" r="6" fill="url(#cheekGrad)" />

        {/* Mouth */}
        {expression === 'celebrate' ? (
          <path d="M52 74 Q60 82, 68 74" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M54 73 Q60 78, 66 73" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}

        {/* Waving hand for wave expression */}
        {expression === 'wave' && (
          <g className="animate-wave-hand" style={{ transformOrigin: '90px 60px' }}>
            <ellipse cx="96" cy="56" rx="7" ry="5" fill="url(#bodyGrad)" stroke="#0284c7" strokeWidth="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
