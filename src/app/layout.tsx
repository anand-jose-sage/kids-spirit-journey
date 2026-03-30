import type { Metadata, Viewport } from 'next';
import { Anek_Malayalam } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';

const anekMalayalam = Anek_Malayalam({
  subsets: ['malayalam', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-anek',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.shiloha.in'),
  title: 'Shiloha — 30 Days with God',
  description: 'A 30-day spiritual adventure for kids. Grow in faith, love, and courage!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shiloha',
  },
  openGraph: {
    title: 'Shiloha — 30 Days with God',
    description: 'A 30-day spiritual adventure for kids. Grow in faith, love, and courage!',
    url: 'https://www.shiloha.in',
    siteName: 'Shiloha',
    images: [
      {
        url: '/images/preview.png',
        width: 1200,
        height: 630,
        alt: 'Shiloha — 30 Days with God',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiloha — 30 Days with God',
    description: 'A 30-day spiritual adventure for kids. Grow in faith, love, and courage!',
    images: ['/images/preview.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={anekMalayalam.variable}>
        <LanguageProvider>
          <AuthProvider>
            <div className="max-w-lg mx-auto min-h-screen relative">
              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
