import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://create-it.app';
  const now = new Date();

  return [
    { url: base,                        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/tarifs`,            lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/auth/signup`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/auth/login`,        lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/blog`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/exemples`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/contact`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/legal/mentions-legales`,   lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/confidentialite`,    lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/cgv`,                lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
  // Excluded: /dashboard, /editor, /admin, /analytics, /settings, /generate, /sites
}
