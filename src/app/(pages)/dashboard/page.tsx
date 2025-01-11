import StatsListComponent from '#/components/stats-list/stats-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Dashboard - Flash Cards',
  description:
    'View your learning progress, recent sets, and study statistics in one place.',
  keywords: [
    'flash cards dashboard',
    'learning progress',
    'study statistics',
    'flashcards overview',
    'learning dashboard',
  ],
  openGraph: {
    title: 'Dashboard - Flash Cards',
    description:
      'View your learning progress, recent sets, and study statistics in one place.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app/',
    siteName: 'Dashboard - Flash Cards',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - Flash Cards',
    description:
      'View your learning progress, recent sets, and study statistics in one place.',
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

export default function DashboardPage() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-16'>
      <StatsListComponent />
    </div>
  );
}
