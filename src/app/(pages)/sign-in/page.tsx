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
};

export default function SignInPage() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <SignInFormComponent />
    </div>
  );
}
