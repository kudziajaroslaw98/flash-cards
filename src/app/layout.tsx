import '#/shared/utils/polyfills';
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import ClientSideProviders from '#/providers/client-side-providers.component';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: 'Flashcards - Learning Words Made Easy',
  description:
    'Flashcards by Jarosław Kudzia is the perfect tool for mastering vocabulary and learning words effortlessly.',
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  keywords: [
    // high importance keywords for search engines
    'flashcards',
    'flashcards app',
    'learning words made easy',
    'study tool',
    'vocabulary learning',
    'language learning',
    'spaced repetition',
    'active recall',
    // secondary keywords for search engines
    'custom flashcards',
    'language practice',
    'study flashcards',
    'word practice',
    'memory training',
    'efficient studying',
    'word recall practice',
    'learn vocabulary fast',
    // Long tail keywords for search engines
    'best flashcards app for studying',
    'how to learn vocabulary effectively',
    'top vocabulary learning tools',
    'easy-to-use flashcards for language learning',
    'personalized flashcards for better memory',
    'improve language skills with flashcards',
    'study planner with spaced repetition',
    // broader reach keywords for search engines
    'vocabulary trainer tools',
    'educational tools for memory improvement',
    'flashcards website for learning',
    'language study resources',
    'learning apps for vocabulary building',
  ],
  openGraph: {
    title: 'Flashcards - Learning Words Made Easy',
    description:
      'Flashcards by Jarosław Kudzia is the perfect tool for mastering vocabulary and learning words effortlessly.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app',
    siteName: 'Flashcards - Learning Words Made Easy',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flashcards - Learning Words Made Easy',
    description:
      'Flashcards by Jarosław Kudzia is the perfect tool for mastering vocabulary and learning words effortlessly.',
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
  applicationName: 'Flashcards - Learning Words Made Easy',
  alternates: {
    canonical: 'https://flashcards.finalphase.app/',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={`${inter.variable} ${roboto_mono.variable} dark flex font-sans`}
      suppressHydrationWarning
    >
      <head>
        <Script
          defer
          src={`/xs.js`}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID!}
          strategy='lazyOnload'
        />

        {process.env.NODE_ENV === 'development' &&
          process.env.TURBO !== 'true' && (
            <Script src={`https://unpkg.com/react-scan/dist/auto.global.js`} />
          )}
      </head>
      <body
        suppressHydrationWarning
        className='min-w-screen relative flex h-auto min-h-screen w-full grow flex-col text-gray-500 dark:text-slate-500'
      >
        <ClientSideProviders>{children}</ClientSideProviders>
      </body>
    </html>
  );
}
