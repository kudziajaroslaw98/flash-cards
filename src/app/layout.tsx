import { Inter, Roboto_Mono } from 'next/font/google';
import type { Metadata } from 'next';

import ClientSideProviders from '#/providers/client-side-providers.component';
import SidebarComponent from '#/components/sidebar/sidebar';
import HeaderComponent from '#/components/header/header';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import './globals.css';

const ToastsComponent = dynamic(() => import('#/components/toasts/toasts'), {
  ssr: false,
});

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
  title: 'Flash Cards - Learning Words Made Easy',
  description:
    'Flash Cards by Jarosław Kudzia is the perfect tool for mastering vocabulary and learning words effortlessly.',
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  keywords: [
    // high importance keywords for search engines
    'flash cards',
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
    title: 'Flash Cards - Learning Words Made Easy',
    description:
      'Flash Cards by Jarosław Kudzia is the perfect tool for mastering vocabulary and learning words effortlessly.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og-image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://flashcards.finalphase.app',
    siteName: 'Flash Cards - Learning Words Made Easy',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flash Cards - Learning Words Made Easy',
    description:
      'Flash Cards by Jarosław Kudzia is the perfect tool for mastering vocabulary and learning words effortlessly.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og-image.png',
        width: 800,
        height: 600,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  applicationName: 'Flash Cards - Learning Words Made Easy',
  alternates: {
    canonical: 'https://flashcards.finalphase.app',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = cookies().get('theme')?.value;

  return (
    <html
      lang='en'
      className={`${inter.variable} ${roboto_mono.variable} flex font-sans ${theme}`}
      suppressHydrationWarning
    >
        <head>
          <Script
            src={`/xs.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID!}
            strategy="lazyOnload"
          />
        </head>
      <body
        suppressHydrationWarning
        className='min-w-screen relative flex h-auto min-h-full w-full grow flex-col'
      >
        <ClientSideProviders>
          <div className='flex h-auto min-h-full w-full flex-col  bg-gradient-to-b from-gray-50 to-gray-200 pt-20 dark:from-slate-900 dark:to-slate-950 md:pt-0'>
            <ToastsComponent />

            <div className='mx-auto flex h-auto min-h-full w-full max-w-7xl gap-12 p-4 xl:gap-12'>
              <HeaderComponent />
              <SidebarComponent />
              <main className='relative flex h-auto min-h-full w-full flex-col md:pt-24'>
                {children}
              </main>
            </div>
          </div>
        </ClientSideProviders>
      </body>
    </html>
  );
}
