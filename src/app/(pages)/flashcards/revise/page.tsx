import FlashcardReviseComponent from '#/components/flash-card-revise/flash-card-revise';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Revise Flashcards - Review and Remember',
  description:
    'Review your flashcards with our advanced revision system. Strengthen your memory and track your progress.',
  keywords: [
    'flashcard revision',
    'review system',
    'memory improvement',
    'progress tracking',
    'study review',
    'revision mode',
    'memory reinforcement',
  ],
  openGraph: {
    title: 'Revise Flashcards - Review and Remember',
    description:
      'Review your flashcards with our advanced revision system. Strengthen your memory and track your progress.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app/',
    siteName: 'Revise Flashcards - Review and Remember',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revise Flashcards - Review and Remember',
    description:
      'Review your flashcards with our advanced revision system. Strengthen your memory and track your progress.',
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

export default function RevisePage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center'>
      <FlashcardReviseComponent />
    </div>
  );
}
