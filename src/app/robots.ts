import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/editor', '/api', '/settings', '/sites'],
    },
    sitemap: 'https://create-it.app/sitemap.xml',
  };
}
