import type { Metadata, Viewport } from 'next';
import { Anek_Malayalam, Cinzel, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';

const anekMalayalam = Anek_Malayalam({
  subsets: ['malayalam', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-anek',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const BASE_URL = 'https://www.shiloha.in';
const TITLE    = 'Shiloha — Marian Study';
const DESC     = 'A free 30-day Marian study app for Catholic kids and families. Daily lessons on Our Lady, Bible verses, quizzes, and prayers to deepen devotion to Mary.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: TITLE,
    template: '%s | Shiloha',
  },
  description: DESC,
  applicationName: 'Shiloha',
  authors: [{ name: 'Shiloha' }],
  keywords: [
    'Marian study', 'Catholic Marian app', '30 days with Mary',
    'Our Lady devotion kids', 'Marian devotion app', 'Malayalam Catholic app',
    'children Marian prayer', 'daily Mary lessons', 'Shiloha', 'ശിലോഹ',
  ],
  category: 'education',
  manifest: '/manifest.json',
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
    shortcut: '/images/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shiloha',
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: BASE_URL,
    siteName: 'Shiloha',
    locale: 'en_IN',
    images: [
      {
        url: '/images/preview.png',
        width: 1200,
        height: 630,
        alt: 'Shiloha — Marian Study',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ['/images/preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EDE9F8',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Shiloha',
  url: 'https://www.shiloha.in',
  description: 'A free 30-day Marian study app for Catholic kids and families. Daily lessons on Our Lady, Bible verses, quizzes, and prayers.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: ['en', 'ml'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Children',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Cherupusha Mission League',
    alternateName: 'Shiloha',
    location: 'Manathavady',
    url: 'https://www.shiloha.in',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://rhgqtrcoiqmeobzrshpf.supabase.co" />
        <link rel="dns-prefetch" href="https://rhgqtrcoiqmeobzrshpf.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}`,
          }}
        />
      </head>
      <body className={`${anekMalayalam.variable} ${cinzel.variable} ${cormorantGaramond.variable}`}>
        <LanguageProvider>
          <AuthProvider>
            <main className="max-w-lg mx-auto min-h-screen relative">
              {children}
            </main>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
