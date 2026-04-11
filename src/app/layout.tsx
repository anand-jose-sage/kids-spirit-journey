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

const BASE_URL = 'https://www.shiloha.in';
const TITLE    = 'Shiloha — 30 Days with God';
const DESC     = 'A free 30-day spiritual journey app for Catholic kids. Daily Bible readings, activities, games, and prayers to help children grow in faith, love, and courage.';

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
    'kids spiritual journey', 'Catholic children app', '30 days with God',
    'Bible activities for kids', 'Easter devotional', 'Malayalam Catholic app',
    'children faith app', 'daily Bible reading kids', 'Shiloha', 'ശിലോഹ',
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
        alt: 'Shiloha — 30 Days with God',
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
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Shiloha',
  url: 'https://www.shiloha.in',
  description: 'A free 30-day spiritual journey app for Catholic kids. Daily Bible readings, activities, games, and prayers.',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
