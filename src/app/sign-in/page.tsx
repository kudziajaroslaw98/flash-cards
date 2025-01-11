import SignInFormComponent from '#/components/sign-in-form/sign-in-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Sign In - Flash Cards',
  description:
    'Sign in to your Flash Cards account to access your personalized study materials and track your progress.',
  keywords: [
    'flash cards login',
    'sign in',
    'user account',
    'access flashcards',
    'student login',
    'learning account',
  ],
  openGraph: {
    title: 'Flash Cards - Learning Words Made Easy',
    description:
      'Sign in to your Flash Cards account to access your personalized study materials and track your progress.',
    images: [
      {
        url: 'https://flashcards.finalphase.app/og/og_image.png',
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
      'Sign in to your Flash Cards account to access your personalized study materials and track your progress.',
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

export default function SignInPage() {
  return (
    <div className='flex h-auto min-h-full w-full flex-col  bg-gray-50  px-4 dark:bg-slate-950'>
      <div className='flex h-full w-full items-center justify-center'>
        <SignInFormComponent />
      </div>
    </div>
  );
}
