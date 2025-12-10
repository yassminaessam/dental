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
        {/* Favicons - using API endpoint that serves from database settings or fallback */}
        {/* Standard favicon for modern browsers */}
        <link rel="icon" href="/api/favicon" type="image/svg+xml" />
        {/* Shortcut icon for older browsers and Safari */}
        <link rel="shortcut icon" href="/api/favicon" />
        {/* Apple Touch Icon for iOS Safari (home screen bookmark) */}
        <link rel="apple-touch-icon" href="/api/favicon" />
        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/api/favicon" color="#2563eb" />
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
