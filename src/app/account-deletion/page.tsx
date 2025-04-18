import { Button } from '#/components/_ui/button/button';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { cn } from '#/shared/utils/cn.util';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'How to Delete Your Final Phase Account',
  description:
    'Step-by-step instructions on how to permanently delete your Final Phase account and all associated data, including flashcards, sets, and progress.',
  keywords: [
    'delete account',
    'remove account',
    'account deletion',
    'Final Phase account',
    'data removal',
    'delete flashcards',
    'privacy',
  ],
  openGraph: {
    title: 'How to Delete Your Final Phase Account',
    description:
      'Learn how to permanently remove your Final Phase account and data.',
    images: [
      {
        url: 'https://finalphase.app/og/og_image.png',
        width: 1200,
        height: 630,
      },
    ],
    url: 'https://finalphase.app/account-deletion',
    siteName: 'Final Phase',
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Delete Your Final Phase Account',
    description:
      'Learn how to permanently remove your Final Phase account and data.',
    images: [
      {
        url: 'https://finalphase.app/og/og_image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
  applicationName: 'Final Phase',
  alternates: {
    canonical: 'https://finalphase.app/account-deletion',
  },
  manifest: '/manifest.json',
};

export default function AccountDeletionPage() {
  return (
    <div className='dark relative h-auto min-h-full w-full flex-col items-center justify-center bg-slate-950 px-4'>
      <header className='fixed left-0 top-0 z-50 hidden h-32 w-full flex-col items-center justify-center md:flex '>
        <div className='absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-transparent bg-[radial-gradient(transparent_1px,#020617_1px)] from-transparent via-black via-60% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t' />
        <nav className='z-30 flex h-full w-full items-start justify-between px-4 py-4 md:px-16 md:pt-8'>
          <div className='flex items-center justify-center'>
            <Image
              src='/images/finalphase-logo.svg'
              alt='Final Phase Logo'
              width={32}
              height={32}
            />
            <span
              className={`hidden overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text px-1 font-fredoka text-xl font-black tracking-tight text-transparent transition-all lg:flex`}
            >
              Final Phase
            </span>
          </div>
          <ul className='flex flex-row items-center justify-center gap-4 text-slate-200'>
            <li className='pl-8'>
              <Link href={APP_ROUTES.signIn}>
                <Button
                  variant='primary-outline'
                  label='Get Started Free'
                  className='group mx-auto min-w-36 font-semibold'
                  alt='Redirect to sign in page'
                />
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <div
        className={cn([
          'prose mx-auto py-36 prose-headings:mt-8 prose-headings:font-bold prose-h1:text-5xl prose-h2:text-4xl prose-h2:font-extrabold prose-h3:text-xl prose-h3:font-bold',
          'text-gray-600 prose-h1:text-green-400 prose-h2:text-gray-800 prose-h3:text-gray-600 prose-strong:text-green-400',
          'dark:text-slate-400 dark:prose-h1:text-green-400 dark:prose-h2:text-slate-200 dark:prose-h3:text-slate-400 dark:prose-a:text-green-400 dark:prose-a:underline-offset-4 dark:hover:prose-a:text-green-500',
        ])}
      >
        <div className='flex w-full justify-between'>
          <Link
            href={'/'}
            className='z-[100]'
            aria-label='Back to Home'
          >
            <Button
              alt='go back button'
              label='Home'
              icon={<ArrowLeft className='size-4' />}
              iconPosition='left'
              size={'sm'}
            />
          </Link>
          <Link
            href={'/privacy-policy'}
            className='z-[100]'
            aria-label='Go to Privacy Policy'
          >
            <Button
              alt='go to privacy policy'
              label='Privacy Policy'
              icon={<ArrowRight className='size-4' />}
              iconPosition='right'
              size={'sm'}
            />
          </Link>
        </div>

        <h1>How to Delete Your Final Phase Account</h1>

        <p>
          We understand that you may wish to delete your account and associated
          data. This guide explains the process. Please remember that{' '}
          <strong>account deletion is permanent and irreversible</strong>.
        </p>

        <h2>Before You Proceed</h2>
        <p>Deleting your account will permanently remove:</p>
        <ul>
          <li>
            Your user profile information (email, name, avatar if linked).
          </li>
          <li>
            All your flashcards, sets, study plans, reminders, and associated
            progress data stored on our servers.
          </li>
          <li>Your subscription information (if applicable).</li>
          <li>Your push notification subscriptions linked to the account.</li>
        </ul>
        <p>
          Data stored only locally on your device (if you used the app logged
          out or before syncing) will remain on that device but will no longer
          be able to sync.
        </p>

        <h2>Steps to Delete Your Account</h2>
        <p>
          Account deletion must be initiated from within the Final Phase
          application while you are logged in.
        </p>
        <ol>
          <li>
            <strong>Log In:</strong> Ensure you are logged into the Final Phase
            account you wish to delete.
          </li>
          <li>
            <strong>Navigate to Settings:</strong> Access the main menu or
            sidebar and go to the{' '}
            <Link href={APP_ROUTES.account.settings}>Account Settings</Link>{' '}
            page. (You must be logged in to access this page).
          </li>
          <li>
            <strong>Find the Danger Zone:</strong> Within the Settings page,
            scroll down or look for a section labeled &quot;Danger Zone&quot;.
            This section contains critical actions like data clearing and
            account deletion.
          </li>
          <li>
            <strong>Locate Delete Account:</strong> Inside the &quot;Danger
            Zone&quot;, you will find a button or option labeled &quot;Delete
            Account&quot;. It might be within an accordion or clearly marked
            with a warning.
          </li>
          <li>
            <strong>Initiate Deletion:</strong> Click the &quot;Delete
            Account&quot; button.
            <div className='my-4 flex w-full justify-center'>
              <Button
                label='Delete Account'
                variant='destructive'
                disabled
                icon={<Trash2 className='size-4' />}
                className='cursor-not-allowed opacity-70'
                alt='Delete Account Example Button'
              />
            </div>
          </li>
          <li>
            <strong>Confirm Deletion:</strong> A confirmation prompt or dialog
            box will appear, asking you to confirm that you understand the
            consequences and wish to proceed. Read the warning carefully. To
            confirm, you will typically need to click a button like
            &quot;Confirm&quot; or &quot;Yes, Delete My Account&quot;.
          </li>
          <li>
            <strong>Account Deleted:</strong> Once confirmed, the deletion
            process will begin. This may take a few moments. You will likely be
            logged out automatically. Your account and associated cloud data
            will be permanently removed from our systems.
          </li>
        </ol>

        <h2>Having Trouble?</h2>
        <p>
          If you encounter any issues logging in or finding the delete option,
          please contact our support team for assistance at{' '}
          <a href='mailto:support@finalphase.app'>support@finalphase.app</a>.
        </p>

        <p>
          We&apos;re sorry to see you go, but we respect your decision regarding
          your data and privacy.
        </p>
      </div>
    </div>
  );
}
