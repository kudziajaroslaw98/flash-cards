import FlashCardsList from '#/components/flash-cards-list/flash-cards-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Learn with Flash Cards - Interactive Learning',
  description:
    'Start learning with our interactive flash card system. Master new concepts through active recall and spaced repetition.',
  keywords: [
    'flash card learning',
    'interactive learning',
    'spaced repetition',
    'active recall',
    'study mode',
    'learn vocabulary',
    'memorization technique',
  ],
  openGraph: {
    title: 'Learn with Flash Cards - Interactive Learning',
    description:
      'Start learning with our interactive flash card system. Master new concepts through active recall and spaced repetition.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app/',
    siteName: 'Learn with Flash Cards - Interactive Learning',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn with Flash Cards - Interactive Learning',
    description:
      'Start learning with our interactive flash card system. Master new concepts through active recall and spaced repetition.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
  },
  robots: {
    index: true,
    follow: false,
  },
  applicationName: 'Flash Cards - Learning Words Made Easy',
  alternates: {
    canonical: 'https://flashcards.finalphase.app/',
  },
  manifest: '/manifest.json',
};

export default async function LearnPage() {
  return (
    <div className='flex h-full w-full flex-col items-center gap-16'>
      <FlashCardsList />
    </div>
  );
}
