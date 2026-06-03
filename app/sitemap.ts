import type { MetadataRoute } from 'next';
import { fleet } from '@/lib/fleet';

const BASE_URL = 'https://slothrentacar.com';
const LOCALES = ['es', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Home pages
  for (const locale of LOCALES) {
    routes.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
  }

  // Vehicle pages
  for (const locale of LOCALES) {
    for (const vehicle of fleet) {
      routes.push({
        url: `${BASE_URL}/${locale}/vehicles/${vehicle.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return routes;
}
