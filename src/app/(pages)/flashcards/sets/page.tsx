import Sets from '#/components/sets/sets';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Flash Card Sets - Organize Your Learning',
  description:
    'Create, manage, and study your flash card sets. Organize your learning materials efficiently.',
  keywords: [
    'flash card sets',
    'study sets',
    'flashcard collections',
    'learning materials',
    'vocabulary sets',
    'organize flashcards',
  ],
  openGraph: {
    title: 'Flash Card Sets - Organize Your Learning',
    description:
      'Create, manage, and study your flash card sets. Organize your learning materials efficiently.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app/',
    siteName: 'Flash Card Sets - Organize Your Learning',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flash Card Sets - Organize Your Learning',
    description:
      'Create, manage, and study your flash card sets. Organize your learning materials efficiently.',
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

export default function SetsPage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center md:pb-24'>
      <Sets />
    </div>
  );
}
