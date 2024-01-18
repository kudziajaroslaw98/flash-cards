import HeaderComponent from '#/components/header/header.component';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flash cards',
  description: 'Learning words made easy',
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
      className='dark flex'
    >
      <body
        className={
          inter.className +
          'min-w-screen flex w-full grow flex-col bg-gradient-to-b from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-950'
        }
      >
        <HeaderComponent />

        <main className='mx-auto flex w-full max-w-6xl flex-col p-4'>
          {children}
        </main>
      </body>
    </html>
  );
}
