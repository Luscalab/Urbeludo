'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { LocalPersistence } from '@/lib/local-persistence';

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  user: any | null;
  isUserLoading: boolean;
  userError: Error | null;
  firestore: any;
  auth: any;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * Provider de Estado Local (Mock de Firebase).
 * Atua como o cérebro offline do aplicativo Standalone.
 */
export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocalUser = async () => {
      try {
        const uid = await LocalPersistence.getUserId();
        if (uid) {
          setUser({ uid, isAnonymous: true });
        }
      } catch (e) {
        // Silencioso, deixa o AuthInitializer resolver
      } finally {
        setIsLoading(false);
      }
    };

    loadLocalUser();

    const handleUpdate = () => loadLocalUser();
    window.addEventListener('local-data-updated', handleUpdate);
    return () => window.removeEventListener('local-data-updated', handleUpdate);
  }, []);

  const contextValue = useMemo(() => ({
    areServicesAvailable: true,
    user,
    isUserLoading: isLoading,
    userError: null,
    firestore: {},
    auth: { signOut: () => LocalPersistence.clear() },
  }), [user, isLoading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return context;
};

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
