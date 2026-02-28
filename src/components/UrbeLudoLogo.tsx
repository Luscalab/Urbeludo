
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

      {/* Skyline - Prédios Estilizados */}
      <path 
        d="M22 75 L22 55 Q22 52 25 52 L32 52 Q35 52 35 55 L35 75 Z" 
        fill="currentColor" opacity="0.4" 
      />
      <path 
        d="M37 75 L37 40 Q37 37 40 37 L50 37 Q53 37 53 40 L53 75 Z" 
        fill="currentColor" opacity="0.6" 
      />
      <path 
        d="M55 75 L55 30 Q55 27 58 27 L68 27 Q71 27 71 30 L71 75 Z" 
        fill="currentColor" opacity="0.5" 
      />
      <path 
        d="M73 75 L73 50 Q73 47 76 47 L83 47 Q86 47 86 50 L86 75 Z" 
        fill="currentColor" opacity="0.4" 
      />

      {/* Sol / Luz de Fundo */}
      <circle cx="50" cy="30" r="10" fill="currentColor" opacity="0.1" />

      {/* Caminho - Curva que cruza a cidade */}
      <path 
        d="M50 95 C 65 85, 35 75, 50 50" 
        stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.2" 
      />

      {/* Silhuetas das Crianças Saltando */}
      {/* Personagem 1 (Esquerda) */}
      <g transform="translate(35, 65) scale(0.8) rotate(-15)">
        <circle cx="0" cy="0" r="5" fill="currentColor" />
        <path 
          d="M0 5 L0 15 M0 10 L-7 5 M0 10 L7 5 M0 15 L-5 22 M0 15 L5 22" 
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
        />
      </g>
      
      {/* Personagem 2 (Direita) */}
      <g transform="translate(68, 62) scale(0.8) rotate(15)">
        <circle cx="0" cy="0" r="5" fill="currentColor" />
        <path 
          d="M0 5 L0 15 M0 10 L-7 5 M0 10 L7 5 M0 15 L-5 22 M0 15 L5 22" 
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
        />
        {/* Detalhe do cabelo/rabicho */}
        <path d="M4 -3 Q6 -1 4 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Linha do Chão */}
      <path d="M10 88 Q50 82 90 88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}
