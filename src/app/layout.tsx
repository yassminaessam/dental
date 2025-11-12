import type {Metadata} from 'next';
import { Toaster } from "../components/ui/toaster"
import { Toaster as Sonner } from 'sonner';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cairo Dental Clinic',
  description: 'Dental Practice Management Dashboard.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/tooth-favicon.svg', type: 'image/svg+xml' },
      { url: '/tooth-favicon.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/tooth-favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' } // fallback
    ],
    shortcut: '/tooth-favicon.svg',
    apple: [
      { url: '/tooth-favicon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
          <Sonner />
        </LanguageProvider>
      </body>
    </html>
  );
}
