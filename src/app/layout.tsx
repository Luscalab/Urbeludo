import type {Metadata, Viewport} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Toaster } from '@/components/ui/toaster';

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
  themeColor: '#33993D',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#33993D" />
      </head>
      <body className="font-body antialiased overflow-x-hidden selection:bg-accent selection:text-accent-foreground">
        <FirebaseClientProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}