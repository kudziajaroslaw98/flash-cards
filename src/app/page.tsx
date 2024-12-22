import {
  AppWindow,
  CircleSlash,
  DollarSign,
  LayoutGrid,
  MailIcon,
  Meh,
  MessageCircleOff,
  Shapes,
  Smile,
  Sparkles,
  XIcon,
} from 'lucide-react';
import { Button } from '#/components/_ui/button/button';
import Card from '#/components/_ui/card/card';

import Badge from '#/components/_ui/badge/badge';
import * as m from 'framer-motion/m';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  // const roadMapPoints = [
  //   {
  //     done: true,
  //     label: 'Revise flash cards using simple spaced repetition algorithm',
  //   },
  //   { done: true, label: 'Synchronize your flash cards across all devices' },
  //   { done: true, label: 'Generating descriptions to words with AI' },
  //   {
  //     done: true,
  //     label:
  //       'Generating new words for deck based on words that are already in it',
  //   },
  //   { done: false, label: 'Generate a set from PDF' },
  //   {
  //     done: false,
  //     label:
  //       'Revise flash cards using more sophisticated spaced repetition algorithm',
  //   },
  //   { done: false, label: 'Community Section with shared decks' },
  //   { done: false, label: 'Filters on flashcard list' },
  // ];

  const painPoints = [
    {
      id: 1,
      icon: <Meh className='size-8 text-green-500' />,
      body: 'It was hard for you to learn a new word?',
    },
    {
      id: 2,
      icon: <MessageCircleOff className='size-8 text-green-500' />,
      body: 'Lack of words you could use in conversations?',
    },
    {
      id: 3,
      icon: <AppWindow className='size-8 text-green-500' />,
      body: 'App you currently use looks bad and distrating?',
    },
    {
      id: 4,
      icon: <Shapes className='size-8 text-green-500' />,
      body: 'Other apps are bloated with unnecessary features?',
    },
  ];

  const valuePoints = [
    {
      id: 1,
      icon: <Smile className='size-8 text-green-500' />,
      body: "It's easy to learn and revise new words",
    },
    {
      id: 2,
      icon: <CircleSlash className='size-8 text-green-500' />,
      body: 'There is no ads.',
    },
    {
      id: 3,
      icon: <Sparkles className='size-8 text-green-500' />,
      body: 'You have access to AI that will help you with creativity block.',
    },
    {
      id: 4,
      icon: <LayoutGrid className='size-8 text-green-500' />,
      body: 'Interface looks good and snapy.',
    },
  ];

  const animatedPlayIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-4 animate-[bounce-horizontal_3s_ease-in-out_infinite] fill-none transition-all group-hover:translate-x-1 group-hover:fill-white'
    >
      <m.polygon
        points='6 3 20 12 6 21 6 3'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.2 }}
      />
    </svg>
  );

  const proLink = new URL(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/sign-in`);
  proLink.searchParams.set(
    'redirect',
    new URL(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/pricing`).href,
  );

  return (
    <div className='dark flex h-auto min-h-full w-full flex-col  bg-gray-50  dark:bg-slate-950'>
      {/* Hero section */}
      <div className='relative mx-auto flex h-auto min-h-full w-full max-w-7xl flex-col items-center justify-center gap-8 p-4 pt-20 md:pt-0 xl:gap-8'>
        <div className='absolute bottom-0 left-0 right-0 top-0 h-[800px] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_20%,#000_70%,transparent_110%)]'></div>
        <div className='relative flex h-[1000px] w-full max-w-2xl flex-col items-center justify-center gap-4'>
          <Image
            src='/images/flash-cards-logo.svg'
            alt='Flash Cards Logo'
            width={64}
            height={64}
          />
          <span className='flex flex-col items-center gap-4 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text p-2 text-center text-5xl !font-black text-transparent'>
            <span>Learning words made</span>
            <span className='relative inline-block max-w-min px-4 before:absolute before:-inset-1 before:block before:-skew-y-3 before:rounded-sm before:bg-green-400'>
              <span className='relative z-10 text-white dark:text-slate-950'>
                easy
              </span>
            </span>
          </span>

          <div className='flex w-full items-center justify-center gap-4'>
            <p className='text-center text-lg text-gray-800 dark:text-slate-200'>
              Anywhere, anytime.
            </p>
          </div>

          <Button
            variant='primary-outline'
            label='Start Now'
            className='group mx-auto mt-8 min-w-36 font-semibold'
            icon={animatedPlayIcon}
            iconPosition='right'
          />

          <div className='hero-section-img mt-16 flex h-96 w-full items-center justify-center rounded-md'></div>
        </div>

        <section className='container flex flex-col items-center justify-center gap-8 py-12'>
          <h4 className='text-gray-800 dark:text-slate-200'>
            Did you ever felt like that?
          </h4>
          <div>
            <ul className='grid w-full grid-cols-1 justify-center gap-4 sm:grid-cols-2'>
              {painPoints.map(({ id, icon, body }) => (
                <li
                  key={`pain-point-${id}`}
                  className='relative flex w-full max-w-72 flex-col gap-8 rounded-md border border-gray-200 p-4 text-sm text-gray-800 dark:border-gray-900  dark:text-slate-200'
                >
                  <div className='absolute left-0 top-0 z-[2] h-full w-full  bg-[radial-gradient(#22c55e15_1px,transparent_1px)] bg-[size:20px_20px]'></div>
                  {icon}
                  <span>{body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='container relative flex flex-col items-center justify-center gap-8 py-12'>
          <div className='absolute left-0 top-0 z-[2] h-full w-full bg-[radial-gradient(at_75%_60%,#7ed321_0px,transparent_50%),radial-gradient(at_64%_21%,#417505_0px,transparent_50%),radial-gradient(at_7%_69%,#417505_0px,transparent_50%)] opacity-20 blur-3xl'></div>
          <div className='z-10 flex flex-col items-center justify-center gap-4'>
            <h4 className='text-green-500'>We felt like that too.</h4>
            <span className='text-gray-800 dark:text-slate-400'>
              That&apos;s why we created this app. The place where...
            </span>
          </div>
          <div>
            <ul className='z-10 grid w-full grid-cols-1 justify-center gap-4 sm:grid-cols-2'>
              {valuePoints.map(({ id, icon, body }) => (
                <li
                  key={`value-point-${id}`}
                  className='relative flex w-full max-w-72 flex-col gap-8 rounded-md border border-gray-200 p-4 text-sm text-gray-800 dark:border-gray-900 dark:text-slate-200'
                >
                  <div className='absolute left-0 top-0 z-[2] h-full w-full  bg-[radial-gradient(#22c55e15_1px,transparent_1px)] bg-[size:20px_20px]'></div>
                  {icon}
                  <span className='z-10 rounded-md bg-black/5 p-2 backdrop-blur-md'>
                    {body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='container z-[2] flex flex-col items-center justify-start rounded-md bg-slate-200/5 py-6 backdrop-blur-md'>
          <div className='flex flex-col items-center gap-4'>
            <h4 className='text-gray-800 dark:text-slate-200'>
              So, what are you waiting for?
            </h4>
            <span className='text-gray-800 dark:text-slate-400'>
              Start learning now!
            </span>
          </div>

          <Button
            variant='primary-outline'
            label='Start Now'
            className='group mx-auto mt-8 min-w-36 font-semibold'
            icon={animatedPlayIcon}
            iconPosition='right'
          />
        </section>

        <section className='container relative flex flex-col items-center justify-center gap-8 py-12'>
          <div className='flex flex-col items-center justify-center gap-4'>
            <h4 className='text-green-500'>Pricing</h4>
            <span className='text-center text-gray-800 dark:text-slate-400'>
              Need more details? We got you covered. <br />
              Here are our plans.
            </span>
          </div>

          <div className='flex flex-wrap  justify-center gap-8 md:gap-4'>
            <Card
              className='w-72'
              motion={false}
            >
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <h5 className='flex items-center justify-between text-2xl font-bold'>
                    <span>Free</span>
                  </h5>

                  <p className='text-sm text-gray-500 dark:text-slate-500'>
                    Free forever, no credit card required
                  </p>
                </div>

                <span className='flex flex-col items-center justify-center py-6'>
                  <span className='flex -translate-x-4 items-center text-7xl font-semibold '>
                    <DollarSign className='size-8 -translate-y-3 text-green-500' />
                    <span>0</span>
                  </span>

                  <span className='pt-2 text-gray-500 dark:text-slate-500'>
                    per month
                  </span>
                </span>
                <Link
                  href='/sign-in'
                  className='contents'
                >
                  <Button
                    label={'Get started'}
                    variant={'primary-outline'}
                    className='font-bold'
                  />
                </Link>

                <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-800'></div>

                <div className='flex flex-col gap-2'>
                  <p className='font-semibold text-gray-600 dark:text-slate-400'>
                    Features:
                  </p>
                  <ul className='flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-500'>
                    <li className='flex gap-2'>
                      <span>•</span>
                      <span>Unlimited flashcards</span>
                    </li>

                    <li className='flex gap-2'>
                      <span>•</span>
                      <span>Unlimited decks</span>
                    </li>

                    <li className='flex gap-2'>
                      <span>•</span>
                      <span>Unlimited revise</span>
                    </li>

                    <li className='flex gap-2'>
                      <span>•</span>
                      <span>Cross-device sync</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className='relative'>
              <Card
                className='z-20 w-72'
                motion={false}
              >
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <h5 className='flex items-center justify-between text-2xl font-bold'>
                      <span>Standard</span>
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Popular
                      </Badge>
                    </h5>
                    <p className='text-sm text-gray-500 dark:text-slate-500'>
                      Not creative today? We got you
                    </p>
                  </div>

                  <span className='flex flex-col items-center justify-center py-6'>
                    <span className='flex -translate-x-4 items-center text-7xl font-semibold'>
                      <DollarSign className='size-8 -translate-y-3 text-green-500' />
                      <span>2.5</span>
                    </span>

                    <span className='pt-2 text-gray-500 dark:text-slate-500'>
                      per month
                    </span>
                  </span>

                  <Link
                    href={proLink.href}
                    className='contents'
                  >
                    <Button
                      label={'Get started'}
                      variant={'primary-outline'}
                      className='font-bold'
                      type='submit'
                    />
                  </Link>

                  <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-800'></div>

                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-gray-600 dark:text-slate-400'>
                      Features:
                    </p>
                    <ul className='flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-500'>
                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Generate flashcards</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Generate set descriptions</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Generate flashcard answers</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Access to all upcoming features</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
              <div className='radial-gradient absolute -left-[2px] -top-[2px] z-10 flex h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md content-[""]'></div>
            </div>
          </div>
        </section>

        <section className='container relative flex flex-col items-center justify-center gap-8 py-12'>
          <div className='flex flex-col items-center justify-center gap-4'>
            <h4 className='text-gray-800 dark:text-slate-200'>Contact</h4>
            <span className='text-center text-gray-800 dark:text-slate-400'>
              More questions? Reach out to us!
            </span>
          </div>

          <div className='flex flex-col items-center justify-center gap-4'>
            <div className='flex flex-col gap-4'>
              <Link
                href={'https://x.com/@baldmanhimself'}
                target='_blank'
                className='flex items-center gap-8 underline decoration-green-500 underline-offset-2'
              >
                <XIcon className='size-6 text-green-500' />
                <span className='text-gray-800 dark:text-slate-200'>
                  @baldmanhimself
                </span>
              </Link>

              <Link
                href={'mailto:jaroslawkudzia73@gmail.com'}
                target='_blank'
                className='flex items-center gap-8 underline decoration-green-500 underline-offset-2'
              >
                <MailIcon className='size-6 text-green-500' />
                <span className='text-gray-800 dark:text-slate-200'>
                  jaroslawkudzia73@gmail.com
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
