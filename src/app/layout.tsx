import '#/shared/utils/polyfills';
import type { Metadata } from 'next';
import { Domine, Fredoka, Inter, Roboto_Mono } from 'next/font/google';

import ClientSideProviders from '#/providers/client-side-providers.component';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const serif_font = Domine({
  display: 'swap',
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400'],
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fredoka',
});

export const metadata: Metadata = {
  title: 'Final Phase: AI Flashcards & Study Tools for Students',
  description:
    'Master any subject faster with Final Phase. AI-powered flashcards, personalized study plans, spaced repetition (SRS), and focus stats for busy students.',
  applicationName: 'Final Phase', // Concise application name

  // --- Authorship ---
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' }, // Brand first
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',

  // --- Keywords (Revised for Final Phase & AI focus) ---
  keywords: [
    // High Importance / Core
    'Final Phase', // Brand name
    'AI flashcards',
    'AI study planner',
    'spaced repetition system',
    'SRS app',
    'flashcards app',
    'study tool',
    'student study app',
    'active recall',
    'focus tracking', // Unique feature
    'study statistics',

    // Secondary / Use Case
    'university study tool',
    'college study app',
    'exam preparation',
    'learn faster',
    'study smarter',
    'efficient studying',
    'save study time',
    'online flashcards',
    'PWA study app', // Progressive Web App

    // Long Tail Keywords
    'best AI flashcard generator for students',
    'study planner app with spaced repetition',
    'how to study effectively for college exams',
    'app to track study focus',
    'flashcard app with AI features',
    'generate flashcards from notes AI',
    'customizable study plans',

    // Broader Reach
    'educational technology',
    'learning tools online',
    'study software',
    'AI study assistant',
    'memory improvement tools',
    'digital flashcards',
  ],

  // --- Open Graph (for social sharing - Facebook, LinkedIn, etc.) ---
  openGraph: {
    title: 'Final Phase: AI Flashcards & Study Tools for Students', // Consistent title
    description:
      'Master subjects faster with AI-powered flashcards, personalized study plans, SRS, and focus stats designed for busy students on Final Phase.', // Slightly adapted for OG
    images: [
      {
        url: 'https://finalphase.app/og/og_image.png', // Ensure this image reflects Final Phase branding
        width: 1200, // Standard OG width
        height: 630, // Standard OG height
      },
    ],
    url: 'https://finalphase.app',
    siteName: 'Final Phase', // Brand name
    locale: 'en-US',
    type: 'website',
  },

  // --- Twitter Card ---
  twitter: {
    card: 'summary_large_image',
    title: 'Final Phase: AI Flashcards & Study Tools for Students', // Consistent title
    description:
      'Master subjects faster with AI-powered flashcards, personalized study plans, SRS, and focus stats designed for busy students on Final Phase.', // Consistent description
    images: [
      {
        url: 'https://finalphase.app/og/og_image.png', // Use the same OG image (ensure it's updated)
        width: 1200,
        height: 630,
      },
    ],
    // Optional: Add creator handle if relevant
    // creator: '@YourTwitterHandle',
  },

  // --- Search Engine Directives ---
  robots: {
    index: true,
    follow: true,
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
  ],

  // --- Web App Manifest & Canonical URL ---
  alternates: {
    canonical: 'https://finalphase.app/',
  },
  manifest: '/manifest.json', // Ensure this manifest file is also updated
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={`${inter.variable} ${roboto_mono.variable} ${serif_font.variable} ${fredoka.variable} dark flex font-sans`}
      suppressHydrationWarning
    >
      <head>
        <Script
          defer
          src={`/analytics.js`}
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
