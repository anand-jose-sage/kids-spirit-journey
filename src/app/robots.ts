import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep auth-gated app routes private; /login and /register are
        // crawlable but carry a noindex meta tag so they won't be ranked.
        disallow: ['/dashboard', '/dashboard/'],
      },
    ],
    sitemap: 'https://www.shiloha.in/sitemap.xml',
  };
}
