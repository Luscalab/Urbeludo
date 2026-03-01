
'use client';

import React from 'react';

export function UrbeLudoLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background Orbital */}
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
      <circle cx="50" cy="50" r="40" fill="currentColor" fillOpacity="0.05" />
      
      {/* City Elements - Abstract Shapes */}
      <path d="M25 70 L35 70 L35 45 L25 55 Z" fill="currentColor" opacity="0.4" />
      <path d="M40 70 L55 70 L55 30 L40 40 Z" fill="currentColor" opacity="0.6" />
      <path d="M60 70 L75 70 L75 40 L60 50 Z" fill="currentColor" opacity="0.4" />

      {/* Dynamic Movement Path */}
      <path 
        d="M15 75 Q40 95, 85 75" 
        stroke="var(--accent, #f43f5e)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        className="aura-glow"
      />

      {/* Ludic Character Jumping */}
      <g transform="translate(50, 45) rotate(-15)">
        {/* Head */}
        <circle cx="0" cy="-14" r="7" fill="currentColor" />
        {/* Body (Action Pose) */}
        <path 
          d="M-10 2 L0 -6 L10 2 M-6 14 L0 0 L6 14" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Magic Aura Sparkles */}
        <circle cx="12" cy="-18" r="2.5" fill="var(--accent, #f43f5e)" />
        <circle cx="-15" cy="-8" r="2" fill="var(--primary, #9333ea)" />
      </g>

      {/* Ground Line */}
      <path d="M10 75 H90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.1" />
    </svg>
  );
}
