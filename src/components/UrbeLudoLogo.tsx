import React from 'react';

export function UrbeLudoLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <rect x="20" y="60" width="15" height="20" rx="2" fill="currentColor" />
      <rect x="42.5" y="40" width="15" height="40" rx="2" fill="currentColor" />
      <rect x="65" y="20" width="15" height="60" rx="2" fill="currentColor" />
      <circle cx="85" cy="15" r="5" fill="var(--accent, #99E630)" />
    </svg>
  );
}