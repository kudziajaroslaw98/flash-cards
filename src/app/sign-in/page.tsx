import SignInFormComponent from '#/components/sign-in-form/sign-in-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Sign In - Flashcards',
  description:
    'Sign in to your Flashcards account to access your personalized study materials and track your progress.',
  keywords: [
    'flashcards login',
    'sign in',
    'user account',
    'access flashcards',
    'student login',
    'learning account',
  ],
  openGraph: {
    title: 'Flashcards - Learning Words Made Easy',
    description:
      'Sign in to your Flashcards account to access your personalized study materials and track your progress.',
    images: [
      {
        url: 'https://finalphase.app/og/og_image.png',
        width: 800,
        height: 600,
      },
    ],
    url: 'https://finalphase.app',
    siteName: 'Flashcards - Learning Words Made Easy',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flashcards - Learning Words Made Easy',
    description:
      'Sign in to your Flashcards account to access your personalized study materials and track your progress.',
    images: [
      {
        url: 'https://finalphase.app/og/og_image.png',
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
    canonical: 'https://finalphase.app/',
  },
  manifest: '/manifest.json',
};

export default function SignInPage() {
  return (
    <div className='flex h-auto min-h-full w-full flex-col  bg-gray-50  px-4 dark:bg-slate-950'>
      <div className='flex h-full w-full items-center justify-center'>
        <SignInFormComponent />
      </div>
    </div>
  );
}
