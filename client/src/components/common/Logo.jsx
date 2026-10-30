import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', showTagline = false, light = false }) {
  const iconSize = size === 'small' ? 'w-7 h-7' : size === 'large' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'small' ? 'text-lg' : size === 'large' ? 'text-2xl' : 'text-xl';

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group select-none">
      <div className={`${iconSize} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 shadow-sm shadow-blue-500/20 transition-transform group-hover:scale-105`}>
        {/* Geometric creative diamond symbol */}
        <svg viewBox="0 0 32 32" className="w-5/6 h-5/6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="20" height="20" rx="4" stroke="white" strokeWidth="2" strokeOpacity="0.4" transform="rotate(45 16 16)" />
          <path d="M16 8L24 16L16 24L8 16Z" fill="white" />
          <circle cx="16" cy="16" r="3" fill="#0F172A" />
          <circle cx="16" cy="9" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none">
          <span className={`font-extrabold tracking-tight ${textSize} ${light ? 'text-white' : 'text-[#0F172A]'}`}>
            Creative<span className="text-blue-600 font-black">Desk</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mb-0.5 animate-pulse"></span>
        </div>
        {showTagline && (
          <span className={`text-[10px] font-medium tracking-wide mt-1 uppercase ${light ? 'text-slate-300' : 'text-slate-500'}`}>
            Your Creative Business, Organized.
          </span>
        )}
      </div>
    </Link>
  );
}
