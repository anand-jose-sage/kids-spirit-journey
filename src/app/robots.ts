import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/', '/login', '/register'],
      },
    ],
    sitemap: 'https://www.shiloha.in/sitemap.xml',
  };
}
