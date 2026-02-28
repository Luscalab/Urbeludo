
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/I18nProvider';

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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#9333ea', // Purple primary
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,800;1,900&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-web-app-capable" content="yes" />
        <meta name="apple-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#9333ea" />
      </head>
      <body className="font-body antialiased overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
        <FirebaseClientProvider>
          <I18nProvider>
            <AuthInitializer>
              {children}
            </AuthInitializer>
            <Toaster />
          </I18nProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
