import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border border-amber-500/60 flex items-center justify-center shadow-md shadow-blue-950/20">
          <svg viewBox="0 0 100 100" className="w-6 h-6">
            <path
              d="M 50 8 L 88 26 L 88 64 Q 88 88 50 96 Q 12 88 12 64 L 12 26 Z"
              fill="none"
              stroke="url(#goldLogoGrad)"
              strokeWidth="5"
            />
            <path
              d="M 64 36 C 42 32 32 46 32 58 C 32 70 44 78 64 74"
              fill="none"
              stroke="url(#goldLogoGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 46 42 L 56 72 L 72 38"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="goldLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-serif-brand text-lg font-bold tracking-wider text-slate-900">
            CAPITAL<span className="text-amber-700">VEST</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Heraldic Shield Emblem */}
      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border border-amber-500/60 flex items-center justify-center shadow-lg shadow-blue-950/25 shrink-0">
        <svg viewBox="0 0 100 100" className="w-7 h-7">
          <path
            d="M 50 8 L 88 26 L 88 64 Q 88 88 50 96 Q 12 88 12 64 L 12 26 Z"
            fill="none"
            stroke="url(#goldLogoGradFull)"
            strokeWidth="5"
          />
          <path
            d="M 50 16 L 80 32 L 80 62 Q 80 82 50 88 Q 20 82 20 62 L 20 32 Z"
            fill="none"
            stroke="#FDE68A"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeDasharray="3,2"
          />
          <path
            d="M 64 36 C 42 32 32 46 32 58 C 32 70 44 78 64 74"
            fill="none"
            stroke="url(#goldLogoGradFull)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 46 42 L 56 72 L 72 38"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points="50,18 52.5,25 59,25 54,29 56,35 50,31 44,35 46,29 41,25 47.5,25"
            fill="url(#goldLogoGradFull)"
          />
          <defs>
            <linearGradient id="goldLogoGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-serif-brand text-xl font-bold tracking-widest text-slate-900 leading-none">
            CAPITAL<span className="text-amber-700">VEST</span>
          </span>
          <span className="text-[10px] font-bold text-amber-900/80 uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300">
            FIDUCIARY
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
          Building Wealth. Securing Generations.
        </span>
      </div>
    </div>
  );
};
