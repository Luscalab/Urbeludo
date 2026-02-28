
'use client';

import React, { ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

/**
 * Provider de Cliente Standalone.
 * Remove a necessidade de inicialização do SDK Firebase.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
