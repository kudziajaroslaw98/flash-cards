import type { MetadataRoute } from 'next/types';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://flashcards.finalphase.app/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://flashcards.finalphase.app/sign-in/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://flashcards.finalphase.app/guide/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
}