
import React from 'react';

export function UrbeLudoLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <rect x="20" y="60" width="15" height="20" rx="4" fill="currentColor" />
      <rect x="42.5" y="40" width="15" height="40" rx="4" fill="currentColor" />
      <rect x="65" y="20" width="15" height="60" rx="4" fill="currentColor" />
      <circle cx="85" cy="15" r="7" fill="var(--accent, #f472b6)" />
      <path d="M10 90 L90 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}
