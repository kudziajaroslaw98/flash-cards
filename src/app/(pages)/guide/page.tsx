import Guide from '#/markdown/guide.mdx';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Guide to Flashcards | How to Use Flashcards Effectively',
  description:
    'Learn what flashcards are, how they work, and how to use our app effectively. Discover tips for studying with flashcards to boost memory and learn vocabulary faster.',
  keywords: [
    'what are flashcards',
    'how to use flashcards',
    'flashcard guide',
    'studying with flashcards',
    'flashcards app tutorial',
    'flashcards for vocabulary learning',
    'effective study tools',
    'active recall techniques',
    'spaced repetition explained',
    'flashcards benefits',
    'memory improvement tips',
    'study methods with flashcards',
    'language learning guide',
    'flashcards study strategies',
  ],
  openGraph: {
    title: 'Guide to Flashcards | How to Use Flashcards Effectively',
    description:
      'Learn what flashcards are, how they work, and how to use our app effectively. Discover tips for studying with flashcards to boost memory and learn vocabulary faster.',
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
    title: 'Guide to Flashcards | How to Use Flashcards Effectively',
    description:
      'Learn what flashcards are, how they work, and how to use our app effectively. Discover tips for studying with flashcards to boost memory and learn vocabulary faster.',
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
    follow: true,
  },
  applicationName: 'Flash Cards - Learning Words Made Easy',
  alternates: {
    canonical: 'https://flashcards.finalphase.app/',
  },
  manifest: '/manifest.json',
};

export default function GuidePageMDX() {
  return (
    <div className='flex h-full w-full flex-col items-center gap-16'>
      <div className='prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white max-w-sm'>
        <Guide />
      </div>
    </div>
  );
}
