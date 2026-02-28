'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Loader2 } from 'lucide-react';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [initStarted, setInitStarted] = useState(false);

  useEffect(() => {
    if (!user && !isUserLoading && !initStarted) {
      setInitStarted(true);
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth, initStarted]);

  if (isUserLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Initializing Playground...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
