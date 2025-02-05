import Sets from '#/components/sets/sets';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Flashcard Sets - Organize Your Learning',
  description:
    'Create, manage, and study your flashcard sets. Organize your learning materials efficiently.',
  keywords: [
    'flashcard sets',
    'study sets',
    'flashcard collections',
    'learning materials',
    'vocabulary sets',
    'organize flashcards',
  ],
  openGraph: {
    title: 'Flashcard Sets - Organize Your Learning',
    description:
      'Create, manage, and study your flashcard sets. Organize your learning materials efficiently.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app/',
    siteName: 'Flashcard Sets - Organize Your Learning',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flashcard Sets - Organize Your Learning',
    description:
      'Create, manage, and study your flashcard sets. Organize your learning materials efficiently.',
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
  applicationName: 'Flashcards - Learning Words Made Easy',
  alternates: {
    canonical: 'https://flashcards.finalphase.app/',
  },
  manifest: '/manifest.json',
};

export default function SetsPage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center md:pb-12'>
      <Sets />
    </div>
  );
}
