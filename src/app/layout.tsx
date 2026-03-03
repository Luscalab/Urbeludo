
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/I18nProvider';
import { AuraHelper } from '@/components/AuraHelper';

export const metadata: Metadata = {
  title: 'UrbeLudo | Playground Urbano Digital',
  description: 'Transforme sua cidade em um playground psicomotor com IA de borda.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UrbeLudo',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#9333ea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
    <html lang="pt-BR">
      <body className="font-body antialiased overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground bg-background">
        <FirebaseClientProvider>
          <I18nProvider>
            <AuthInitializer>
              <AuraHelper />
              {children}
            </AuthInitializer>
            <Toaster />
          </I18nProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
