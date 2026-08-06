import React, { useState } from 'react';
import ohbWideLogo from '../assets/logo/OHB-WIDE-Logo.png';

interface OromiaLogoProps {
  className?: string;
  variant?: 'emblem' | 'full' | 'header' | 'wide';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const OromiaLogo: React.FC<OromiaLogoProps> = ({
  className = '',
  variant = 'header',
  size = 'md',
  showText = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // SVG Emblem vector fallback
  const EmblemSVG = (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="kallacha">
        <path d="M 50,4 C 47,4 45,7 45,10 C 45,12 47,14 50,14 C 53,14 55,12 55,10 C 55,7 53,4 50,4 Z" fill="#F59E0B" />
        <path d="M 43,15 C 43,15 42,22 50,22 C 58,22 57,15 57,15 L 43,15 Z" fill="#D97706" />
        <circle cx="50" cy="9" r="2.5" fill="#FEF3C7" />
      </g>
      <path
        d="M 50,26 C 38,15 14,24 14,44 C 14,64 36,80 50,88 C 64,80 86,64 86,44 C 86,24 62,15 50,26 Z"
        fill="none"
        stroke="#00A3E0"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48,31 C 39,22 22,29 22,44 C 22,58 39,71 48,78"
        fill="none"
        stroke="#005BAC"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M 64,30 C 78,32 82,46 64,56 C 58,46 60,34 64,30 Z" fill="#00A3E0" />
      <path d="M 64,30 C 74,40 76,50 64,56" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M 22,49 L 34,49 L 38,40 L 42,56 L 47,36 L 52,58 L 56,46 L 60,49 L 76,49"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 50,83 C 47,88 47,94 50,96 C 53,94 53,88 50,83 Z" fill="#F59E0B" />
      <circle cx="50" cy="93" r="1.5" fill="#FEF3C7" />
    </svg>
  );

  if (variant === 'wide') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {!imgError ? (
          <img
            src={ohbWideLogo}
            alt="Oromia Health Bureau Wide Logo"
            className="h-16 sm:h-20 w-auto object-contain max-w-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="w-12 h-12 shrink-0">{EmblemSVG}</div>
            <div className="text-left leading-tight font-sans">
              <div className="text-[#00A3E0] font-black text-xs uppercase">BIIROO FAYYAA OROMIYAA</div>
              <div className="text-amber-500 font-bold text-[11px]">ኦሮሚያ ጤና ቢሮ</div>
              <div className="text-[#005BAC] font-black text-xs uppercase">OROMIA HEALTH BUREAU</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'emblem') {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
    };
    return (
      <div className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        {!imgError ? (
          <img
            src={ohbWideLogo}
            alt="OHB Emblem"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          EmblemSVG
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center space-x-3.5 ${className}`}>
        <div className="h-12 w-auto shrink-0 p-1 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
          {!imgError ? (
            <img src={ohbWideLogo} alt="Oromia Health Bureau Logo" className="h-full w-auto object-contain" onError={() => setImgError(true)} />
          ) : (
            EmblemSVG
          )}
        </div>
        {showText && (
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[#00A3E0] font-black tracking-wide text-xs uppercase font-sans">
              BIIROO FAYYAA OROMIYAA
            </span>
            <span className="text-amber-500 font-bold text-[11px] font-sans my-0.5">
              ኦሮሚያ ጤና ቢሮ
            </span>
            <span className="text-[#005BAC] font-black tracking-wide text-xs uppercase font-sans">
              OROMIA HEALTH BUREAU
            </span>
          </div>
        )}
      </div>
    );
  }

  // Header Default Compact variant
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <div className="h-10 w-auto shrink-0 p-1 bg-white rounded-lg shadow-xs border border-slate-200/80 flex items-center justify-center">
        {!imgError ? (
          <img src={ohbWideLogo} alt="OHB Logo" className="h-full w-auto object-contain" onError={() => setImgError(true)} />
        ) : (
          EmblemSVG
        )}
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className="text-[#005BAC] font-extrabold text-sm tracking-tight flex items-center gap-1">
            <span>BIIROO FAYYAA OROMIYAA</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
            OROMIA HEALTH BUREAU • IRB
          </span>
        </div>
      )}
    </div>
  );
};
