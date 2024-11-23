import SignUpFormComponent from '#/components/sign-up-form/sign-up-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Sign Up - Flash Cards',
  description:
    'Create your Flash Cards account to start your learning journey. Access all features and track your progress.',
  keywords: [
    'flash cards signup',
    'create account',
    'register',
    'new user',
    'start learning',
    'free account',
    'join flash cards',
  ],
};

export default function SignUpPage() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <SignUpFormComponent />
    </div>
  );
}
