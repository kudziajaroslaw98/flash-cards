import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import HeaderComponent from '#/components/header/header.component';
import SidebarComponent from '#/components/sidebar/sidebar.component';
import ClientSideProviders from '#/providers/client-side-providers.component';
import CSPostHogProvider from '#/providers/posthog-provider.component';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import './globals.css';

const ToastsComponent = dynamic(
  () => import('#/components/toasts/toasts.component'),
  {
    ssr: false,
  },
);

const PostHogPageView = dynamic(
  () => import('#/components/posthog-page-view/posthog-page-view.component'),
  {
    ssr: false,
  },
);

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
  title: 'Flash cards',
  description: 'Learning words made easy',
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;

  return (
    <html
      lang='en'
      className={`${inter.variable} ${roboto_mono.variable} flex font-sans ${theme ?? 'dark'}`}
      suppressHydrationWarning
    >
      <CSPostHogProvider>
        <body
          suppressHydrationWarning
          className='min-w-screen relative flex h-auto min-h-full w-full grow flex-col bg-gradient-to-b from-gray-50 to-gray-200 pt-20 dark:from-slate-900 dark:to-slate-950 md:pt-0'
        >
          <PostHogPageView />
          <ClientSideProviders>
            <ToastsComponent />

            <div className='mx-auto flex h-auto min-h-full w-full max-w-7xl gap-12 p-4 xl:gap-12'>
              <HeaderComponent />
              <SidebarComponent />
              <main className='relative flex h-auto min-h-full w-full flex-col md:pt-24'>
                {children}
              </main>
            </div>
          </ClientSideProviders>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
