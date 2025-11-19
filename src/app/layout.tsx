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
  // Icons are now managed dynamically by clinic settings
  // See DashboardLayout and PatientLayout for dynamic favicon loading
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
        {/* Default favicon as fallback - will be replaced by clinic settings */}
        <link rel="icon" href="/tooth-favicon.svg" type="image/svg+xml" />
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
