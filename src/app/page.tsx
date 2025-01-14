import { Button } from '#/components/_ui/button/button';
import Card from '#/components/_ui/card/card';
import {
  Activity,
  AppWindow,
  CircleSlash,
  DollarSign,
  Dot,
  GithubIcon,
  LayoutGrid,
  MailIcon,
  Meh,
  MessageCircleOff,
  MessageCircleReply,
  Shapes,
  Smile,
  Sparkles,
} from 'lucide-react';

import Badge from '#/components/_ui/badge/badge';
import LinkComponent from '#/components/_ui/link/link';
import { ScrollReveal } from '#/components/_ui/scroll-reveal/scroll-reveal';
import Timeline from '#/components/_ui/timeline/timeline';
import * as m from 'motion/react-m';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const painPoints = [
    {
      id: 1,
      icon: <Meh className='size-8 text-green-500' />,
      body: 'It was hard for you to learn a new word?',
    },
    {
      id: 2,
      icon: <MessageCircleOff className='size-8 text-green-500' />,
      body: 'You felt like you lack of words you could use in conversations?',
    },
    {
      id: 3,
      icon: <AppWindow className='size-8 text-green-500' />,
      body: 'App you currently use looks bad and distrating?',
    },
    {
      id: 4,
      icon: <Shapes className='size-8 text-green-500' />,
      body: 'App you currently use is bloated with unnecessary features?',
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
    {
      id: 5,
      icon: <MessageCircleReply className='size-8 text-green-500' />,
      body: 'You actually have possibility to make this app better by giving feedback.',
    },
    {
      id: 6,
      icon: <Activity className='size-8 text-green-500' />,
      body: 'You can track your progress and study statistics.',
    },
  ];

  const listItem = (text: string) => (
    <li className='flex gap-2'>
      <Dot className='flex size-6 min-w-6 text-green-500' />
      <span className='max-w-72 hyphens-auto'>{text}</span>
    </li>
  );

  const timelineItems = [
    {
      active: true,
      body: (
        <ul className='flex flex-col gap-2'>
          {listItem('Generate sets from pdf/txt files')}
          {listItem('Filters on flashcard list')}
          {listItem(
            'More detailed flash card - real-world examples, key points, synonyms, related facts.',
          )}
          {listItem('More advanced spaced repetition algorithm')}
        </ul>
      ),
      headline: 'Q1',
    },
    {
      active: false,
      body: (
        <ul className='flex flex-col gap-2'>
          {listItem(
            'Create more rewarding system for flashcards (e.g. streaks/points)',
          )}
          {listItem('More customization options for generating with AI')}
          {listItem('Improved stats page')}
        </ul>
      ),
      headline: 'Q2',
    },
    {
      active: false,
      body: (
        <ul className='flex flex-col gap-2'>
          {listItem(
            'Chrome extension to add flashcards from the text you read on the web',
          )}
          {listItem('Export / Import flashcards to / from CSV')}
          {listItem('Community section with shared decks')}
          <li>More coming soon..</li>
        </ul>
      ),
      headline: 'Q3',
    },
    {
      active: false,
      body: <span>Coming soon..</span>,
      headline: 'Q4',
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
      className='size-4 fill-none transition-all group-hover:translate-x-1 group-hover:fill-white'
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
  proLink.searchParams.set('redirect', 'pricing');

  const containerVariants = {
    hidden: { opacity: 0, y: 50, viewport: { once: true } },
    visible: {
      opacity: 1,
      y: 0,
      viewport: { once: true },
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, viewport: { once: true } },
    visible: { opacity: 1, y: 0, viewport: { once: true } },
  };

  const xLogo = (
    <svg
      className='size-6 fill-green-500 text-green-500'
      viewBox='0 0 1200 1227'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z' />
    </svg>
  );

  return (
    <div className='dark relative h-auto min-h-full w-full flex-col bg-slate-950 px-4'>
      <header className='fixed left-0 top-0 z-50 hidden h-32 w-full flex-col items-center justify-center md:flex '>
        <div className='absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-transparent bg-[radial-gradient(transparent_1px,#020617_1px)] from-transparent via-black via-60% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t' />
        <nav className='z-30 flex h-full w-full items-start justify-between px-4 py-4 md:px-16 md:pt-8'>
          <div className='flex items-center justify-center'>
            <Image
              src='/images/flash-cards-logo.svg'
              alt='Flash Cards Logo'
              width={32}
              height={32}
            />

            <span
              className={`hidden overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text px-1 text-xl font-black uppercase tracking-tighter text-transparent transition-all lg:flex`}
            >
              FlashCards
            </span>
          </div>

          <ul className='flex flex-row items-center justify-center gap-4 text-slate-200'>
            <li>
              <LinkComponent
                href='#features'
                className='text-sm'
              >
                Features
              </LinkComponent>
            </li>

            <li>
              <LinkComponent
                href='#pricing'
                className='text-sm'
              >
                Pricing
              </LinkComponent>
            </li>

            <li>
              <LinkComponent
                href='#roadmap'
                className='text-sm'
              >
                Road Map
              </LinkComponent>
            </li>

            <li>
              <LinkComponent
                href='#contact'
                className='text-sm'
              >
                Contact
              </LinkComponent>
            </li>

            <li className='pl-8'>
              <Link href='/sign-in'>
                <Button
                  variant='primary-outline'
                  label='Start Now'
                  className='group mx-auto min-w-36 font-semibold'
                  icon={animatedPlayIcon}
                  iconPosition='right'
                />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero section */}
      <div className='absolute bottom-0 left-0 right-0 top-0 h-[800px] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_20%,#000_70%,transparent_110%)]'></div>
      <div className='relative mx-auto flex h-auto min-h-full w-full max-w-7xl flex-col items-center justify-center gap-8 p-4 pt-20 md:pt-0 xl:gap-8'>
        <div className='relative flex w-full max-w-2xl flex-col items-center justify-center gap-4 py-32 md:py-48'>
          <Image
            src='/images/flash-cards-logo.svg'
            alt='Flash Cards Logo'
            width={64}
            height={64}
          />

          <span className='flex flex-col items-center gap-4 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text p-2 text-center text-5xl !font-black text-transparent'>
            <span>Learning words made</span>
            <span className='relative inline-block max-w-min px-4 before:absolute before:-inset-1 before:block before:-skew-y-3 before:rounded-sm before:bg-green-400'>
              <span className='relative z-10  text-slate-950'>easy</span>
            </span>
          </span>

          <div className='flex w-full items-center justify-center gap-4'>
            <p className='text-center text-lg text-slate-200'>
              Anywhere, anytime.
            </p>
          </div>

          <Link href='/sign-in'>
            <Button
              variant='primary-outline'
              label='Start Now'
              className='group mx-auto mt-8 min-w-36 font-semibold'
              icon={animatedPlayIcon}
              iconPosition='right'
            />
          </Link>

          <ScrollReveal className='hero-section-img mt-16 flex h-96 w-full items-center justify-center rounded-md'></ScrollReveal>
        </div>

        <section className='container flex flex-col items-center justify-center gap-8 py-12'>
          <ScrollReveal>
            <h4 className='text-slate-200'>Did you ever felt like that?</h4>
          </ScrollReveal>

          <div>
            <m.ul
              variants={containerVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              className='grid w-full grid-cols-1 justify-center gap-4 sm:grid-cols-2'
            >
              {painPoints.map(({ id, icon, body }) => (
                <ScrollReveal
                  key={`pain-point-${id}`}
                  variants={itemVariants}
                >
                  <li className='relative flex w-full max-w-72 flex-col gap-8 rounded-md border  border-gray-900 p-4  text-sm  text-slate-200'>
                    <div className='absolute left-0 top-0 z-[2] h-full w-full  bg-[radial-gradient(#22c55e15_1px,transparent_1px)] bg-[size:20px_20px]'></div>
                    {icon}
                    <span>{body}</span>
                  </li>
                </ScrollReveal>
              ))}
            </m.ul>
          </div>
        </section>

        <section
          id='features'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <div className='absolute left-0 top-0 z-[2] h-full w-full bg-[radial-gradient(at_75%_60%,#7ed321_0px,transparent_50%),radial-gradient(at_64%_21%,#417505_0px,transparent_50%),radial-gradient(at_7%_69%,#417505_0px,transparent_50%)] opacity-20 blur-3xl'></div>
          <ScrollReveal className='z-10 flex flex-col items-center justify-center gap-4'>
            <h4 className='text-green-500'>I felt like that too.</h4>
            <span className='text-center  text-slate-400'>
              That&apos;s why I created this app. The place where...
            </span>
          </ScrollReveal>
          <div>
            <m.ul
              variants={containerVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              className='z-10 grid w-full grid-cols-1 justify-center gap-4 sm:grid-cols-2'
            >
              {valuePoints.map(({ id, icon, body }) => (
                <ScrollReveal
                  key={`value-point-${id}`}
                  variants={itemVariants}
                  className='flex h-full w-full'
                >
                  <li
                    key={`value-point-${id}`}
                    className='relative flex w-full max-w-72 flex-col gap-8 rounded-md border border-gray-900 p-4  text-sm text-slate-200'
                  >
                    <div className='absolute left-0 top-0 z-[2] h-full w-full  bg-[radial-gradient(#22c55e15_1px,transparent_1px)] bg-[size:20px_20px]'></div>
                    {icon}
                    <span className='z-10 rounded-md bg-black/5 p-2 backdrop-blur-md'>
                      {body}
                    </span>
                  </li>
                </ScrollReveal>
              ))}
            </m.ul>
          </div>
        </section>

        <section className='container z-[2] flex flex-col items-center justify-start rounded-md py-6 backdrop-blur-md'>
          <ScrollReveal className='flex flex-col items-center gap-4'>
            <h4 className=' text-slate-200'>So, what are you waiting for?</h4>
            <span className=' text-slate-400'>Start learning now!</span>
          </ScrollReveal>

          <ScrollReveal>
            <Link href='/sign-in'>
              <Button
                variant='primary-outline'
                label='Start Now'
                className='group mx-auto mt-8 min-w-36 font-semibold'
                icon={animatedPlayIcon}
                iconPosition='right'
              />
            </Link>
          </ScrollReveal>
        </section>

        <section
          id='pricing'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <ScrollReveal className='flex flex-col items-center justify-center gap-4'>
            <h4 className='text-green-500'>Pricing</h4>
            <span className='text-center  text-slate-400'>
              Need more details? I got you covered. <br />
            </span>
          </ScrollReveal>

          <m.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={containerVariants}
            className='flex flex-wrap  justify-center gap-8 md:gap-4'
          >
            <ScrollReveal variants={itemVariants}>
              <Card
                className='w-72'
                motion={false}
              >
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <h5 className='flex items-center justify-between text-2xl font-bold'>
                      <span>Free</span>
                    </h5>

                    <p className='text-sm text-slate-500'>
                      Free forever, no credit card required
                    </p>
                  </div>

                  <span className='flex flex-col items-center justify-center py-6'>
                    <span className='flex -translate-x-4 items-center text-7xl font-semibold '>
                      <DollarSign className='size-8 -translate-y-3 text-green-500' />
                      <span>0</span>
                    </span>

                    <span className='pt-2  text-slate-500'>per month</span>
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

                  <div className='h-[2px] w-full bg-slate-800'></div>

                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-slate-400'>Features:</p>
                    <ul className='flex flex-col gap-2 text-sm text-slate-500'>
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
            </ScrollReveal>

            <ScrollReveal
              variants={itemVariants}
              className='relative'
            >
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
                    <p className='text-sm text-slate-500'>
                      Not creative today? I got you
                    </p>
                  </div>

                  <span className='flex flex-col items-center justify-center py-6'>
                    <span className='flex -translate-x-4 items-center text-7xl font-semibold'>
                      <DollarSign className='size-8 -translate-y-3 text-green-500' />
                      <span>2.5</span>
                    </span>

                    <span className='pt-2 text-slate-500'>per month</span>
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

                  <div className='h-[2px] w-full bg-slate-800'></div>

                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-slate-400'>Features:</p>
                    <ul className='flex flex-col gap-2 text-sm text-slate-500'>
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
              <div className='radial-gradient absolute -left-[2px] -top-[2px] z-10 flex h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md opacity-30 content-[""]'></div>
            </ScrollReveal>
          </m.div>
        </section>

        <section
          id='roadmap'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <div className='absolute left-0 top-0 z-[2] h-full w-full bg-[radial-gradient(at_20%_80%,#7ed321_0px,transparent_50%),radial-gradient(at_44%_41%,#417505_0px,transparent_50%),radial-gradient(at_90%_69%,#417505_0px,transparent_50%)] opacity-20 blur-3xl'></div>

          <ScrollReveal className='flex flex-col items-center justify-center gap-4'>
            <h4 className='text-slate-200'>Road Map</h4>
            <span className='text-center text-slate-400'>
              You have decided to support me? Wonderful! <br /> Here is what you
              can expect to come.
            </span>
          </ScrollReveal>

          <ScrollReveal>
            <h5 className='text-green-500'>2025</h5>
          </ScrollReveal>

          <ScrollReveal>
            <Timeline
              items={timelineItems}
              title='2025'
            />
          </ScrollReveal>
        </section>

        <section
          id='contact'
          className='container z-[2] flex flex-col items-center justify-start gap-4 rounded-md  py-6 backdrop-blur-md'
        >
          <ScrollReveal className='flex flex-col items-center justify-center gap-2'>
            <h4 className=' text-slate-200'>Contact</h4>
            <span className='text-center text-slate-400'>
              More questions? Reach out to Me!
            </span>
          </ScrollReveal>

          <m.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={containerVariants}
            className='flex flex-col items-center gap-4'
          >
            <ScrollReveal variants={itemVariants}>
              <Link
                href={'mailto:jaroslawkudzia73@gmail.com'}
                target='_blank'
                className='flex items-center gap-8 underline decoration-green-500 underline-offset-2'
              >
                <MailIcon className='size-6 text-green-500' />
                <span className=' text-slate-200'>
                  jaroslawkudzia73@gmail.com
                </span>
              </Link>
            </ScrollReveal>

            <ScrollReveal variants={itemVariants}>
              <Link
                href={'https://x.com/@baldmanhimself'}
                target='_blank'
                className='flex items-center gap-8 underline decoration-green-500 underline-offset-2'
              >
                {xLogo}
                <span className=' text-slate-200'>@baldmanhimself</span>
              </Link>
            </ScrollReveal>
          </m.div>
        </section>

        <footer className='container relative flex flex-col items-center justify-center gap-8 pt-12'>
          <div className='flex items-center justify-center gap-2'>
            <Image
              src={'/images/flash-cards-logo.svg'}
              alt='Flash Cards Logo'
              width={32}
              height={32}
            />

            <span
              className={`overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text px-2 text-xl font-black uppercase tracking-tighter text-transparent transition-all`}
            >
              FlashCards
            </span>
          </div>

          <div className='flex flex-col items-center justify-center gap-4'>
            <span className='text-center text-slate-400'>
              © {new Date().getFullYear()} Flash Cards. All rights reserved.
            </span>
          </div>

          <div className='flex items-center justify-center gap-4'>
            <Link
              href={'https://x.com/baldmanhimself'}
              target='_blank'
              className='flex items-center gap-8 rounded-full bg-slate-900/50 p-2 underline decoration-green-500 underline-offset-2'
            >
              {xLogo}
            </Link>

            <Link
              href={'https://github.com/kudziajaroslaw98'}
              target='_blank'
              className='flex items-center gap-8 rounded-full bg-slate-900/50 p-2 underline decoration-green-500 underline-offset-2'
            >
              <GithubIcon className='size-6 text-green-500' />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
