import FlashCardReviseComponent from '#/components/flash-card-revise/flash-card-revise';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Revise Flash Cards - Review and Remember',
  description:
    'Review your flash cards with our advanced revision system. Strengthen your memory and track your progress.',
  keywords: [
    'flash card revision',
    'review system',
    'memory improvement',
    'progress tracking',
    'study review',
    'revision mode',
    'memory reinforcement',
  ],
  openGraph: {
    title: 'Revise Flash Cards - Review and Remember',
    description:
      'Review your flash cards with our advanced revision system. Strengthen your memory and track your progress.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app/',
    siteName: 'Revise Flash Cards - Review and Remember',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revise Flash Cards - Review and Remember',
    description:
      'Review your flash cards with our advanced revision system. Strengthen your memory and track your progress.',
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

export default function RevisePage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center'>
      <FlashCardReviseComponent />
    </div>
  );
}
