
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
      {/* Círculo de Fundo do Emblema */}
      <circle cx="50" cy="50" r="48" fill="white" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Atmosfera Urbana */}
      <circle cx="50" cy="50" r="46" fill="var(--primary, #9333ea)" fillOpacity="0.08" />

      {/* Skyline - Prédios Estilizados com Cantos Arredondados */}
      <rect x="22" y="55" width="13" height="20" rx="4" fill="currentColor" opacity="0.3" />
      <rect x="37" y="40" width="16" height="35" rx="5" fill="currentColor" opacity="0.5" />
      <rect x="55" y="30" width="16" height="45" rx="5" fill="currentColor" opacity="0.4" />
      <rect x="73" y="50" width="13" height="25" rx="4" fill="currentColor" opacity="0.3" />

      {/* Caminho Lúdico - Curva Dinâmica */}
      <path 
        d="M20 85 C 40 95, 60 65, 85 75" 
        stroke="var(--accent, #f43f5e)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        className="aura-glow"
      />

      {/* Personagem Saltando (Estilizado/Lúdico) */}
      <g transform="translate(60, 45) scale(0.9) rotate(-10)">
        <circle cx="0" cy="-12" r="6" fill="currentColor" />
        <path 
          d="M-8 0 Q0 -5 8 0 M-4 12 L0 0 L4 12" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>

      {/* Elementos Decorativos - Estrelas/Brilhos */}
      <path d="M85 25 L87 30 L92 32 L87 34 L85 39 L83 34 L78 32 L83 30 Z" fill="var(--accent, #f43f5e)" opacity="0.6" />
      <circle cx="15" cy="20" r="3" fill="var(--primary, #9333ea)" opacity="0.4" />
      
      {/* Linha de Chão Lúdica */}
      <path d="M10 85 Q50 78 90 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.1" />
    </svg>
  );
}
