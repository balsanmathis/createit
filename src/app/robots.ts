import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/',
        '/editor',
        '/editor/',
        '/admin',
        '/admin/',
        '/analytics',
        '/analytics/',
        '/settings',
        '/settings/',
        '/generate',
        '/generate/',
        '/sites',
        '/sites/',
        '/api/',
      ],
    },
    sitemap: 'https://www.create-it.app/sitemap.xml',
  };
}
