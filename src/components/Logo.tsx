import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 42, showText = true }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="cyanGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Yellow base corner accent */}
          <path d="M 140 326 L 332 225 L 332 312 L 140 326 Z" fill="url(#goldGradient)" opacity="0.95" />

          {/* Antennas */}
          <line x1="172" y1="102" x2="118" y2="44" stroke="#ec4899" strokeWidth="10" strokeLinecap="round" />
          <circle cx="118" cy="44" r="8" fill="#ec4899" />
          <line x1="208" y1="102" x2="230" y2="48" stroke="#ec4899" strokeWidth="10" strokeLinecap="round" />
          <circle cx="230" cy="48" r="8" fill="#ec4899" />

          {/* Retro TV Bezel */}
          <rect
            x="58"
            y="102"
            width="274"
            height="206"
            rx="28"
            ry="28"
            fill="#0f172a"
            stroke="url(#pinkGradient)"
            strokeWidth="16"
            strokeLinejoin="round"
          />

          {/* Hot pink play triangle */}
          <polygon points="88,136 206,192 88,248" fill="#ec4899" />

          {/* LKTV text */}
          <text
            x="114"
            y="228"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontWeight="900"
            fontSize="74"
            letterSpacing="2"
            fill="#22d3ee"
            style={{ textShadow: '0 0 10px rgba(34,211,238,0.7)' }}
          >
            LKTV
          </text>

          {/* Cyan orbital swoosh ring */}
          <path
            d="M 22 308 C 28 322, 54 330, 80 322 C 160 298, 280 230, 390 118 C 392 116, 388 126, 376 138 C 274 246, 154 316, 68 334 C 44 339, 20 330, 16 316 C 14 310, 18 304, 22 308 Z"
            fill="url(#cyanGradient)"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              LK<span className="text-pink-500">-</span>Clientes
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Gestão & Cobrança Mensalista
          </span>
        </div>
      )}
    </div>
  );
};
