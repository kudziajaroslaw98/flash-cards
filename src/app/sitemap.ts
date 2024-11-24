import type { MetadataRoute } from "next/types";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://flashcards.finalphase.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://flashcards.finalphase.app/flashcards/learn',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: 'https://flashcards.finalphase.app/flashcards/sets',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: 'https://flashcards.finalphase.app/dashboard',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: 'https://flashcards.finalphase.app/sign-in',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: 'https://flashcards.finalphase.app/flashcards/revise',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  ]
}