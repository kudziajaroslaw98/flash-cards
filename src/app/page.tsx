import { Button } from '#/components/_ui/button/button';
import Card from '#/components/_ui/card/card';
import {
  BellOff,
  BrainCircuit,
  BrainCog,
  CalendarCheck,
  ChartLine,
  Check,
  DollarSign,
  Dot,
  Eye,
  GithubIcon,
  Hourglass,
  Library,
  MailIcon,
  MessageSquarePlus,
  Sparkles,
} from 'lucide-react';

import { Accordion } from '#/components/_ui/accordion/accordion';
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
      icon: <Library className='size-8 text-green-500' />,
      body: 'Drowning in lecture notes and textbook chapters?',
    },
    {
      id: 2,
      icon: <Hourglass className='size-8 text-green-500' />,
      body: 'Spending more time making flashcards than actually studying?',
    },
    {
      id: 3,
      icon: <BrainCog className='size-8 text-green-500' />,
      body: 'Forgetting key information right before the exam creeps up?',
    },
    {
      id: 4,
      icon: <BellOff className='size-8 text-green-500' />,
      body: 'Struggling to stay focused during long study sessions?',
    },
  ];

  const valuePoints = [
    {
      id: 1,
      icon: <Sparkles className='size-8 text-green-500' />,
      body: 'AI instantly generates flashcards from your topics, saving you hours.',
    },
    {
      id: 2,
      icon: <BrainCircuit className='size-8 text-green-500' />,
      body: 'You master concepts long-term with smart spaced repetition (SRS)',
    },
    {
      id: 3,
      icon: <CalendarCheck className='size-8 text-green-500' />,
      body: 'AI helps create tailored study plans to fit your goals and deadlines.',
    },
    {
      id: 4,
      icon: <Eye className='size-8 text-green-500' />,
      body: 'You study without distractions in a clean, intuitive interface.',
    },
    {
      id: 5,
      icon: <ChartLine className='size-8 text-green-500' />,
      body: 'You track your focus and progress with insightful, actionable statistics.',
    },
    {
      id: 6,
      icon: <MessageSquarePlus className='size-8 text-green-500' />,
      body: 'You shape the future of Final Phase with your feedback and ideas.',
    },
  ];

  const faqItems = [
    {
      question: 'What is Final Phase?',
      answer:
        'Final Phase is an AI-powered learning application designed to help students study more effectively. It uses digital flashcards, a smart spaced repetition system (SRS) for long-term memory, AI tools to generate content and personalized study plans, and provides stats to track your progress and focus.',
    },
    {
      question: 'How does the AI work?',
      answer:
        "Our AI (powered by Google's Generative AI models) analyzes the topics, existing content, and preferences you provide to generate relevant flashcards, suggest tailored study schedules based on your goals and deadlines, create descriptions for your study sets, and provide summaries for incorrectly answered cards. This saves you time and helps personalize your learning.",
    },
    {
      question: 'What is Spaced Repetition (SRS)?',
      answer:
        'Spaced Repetition is a learning technique that involves reviewing information at increasing intervals. Our app uses an algorithm to determine the optimal time to show you each flashcard again, helping you move information from short-term to long-term memory efficiently.',
    },
    {
      question: 'Is Final Phase free to use?',
      answer:
        "Yes, Final Phase offers a generous free plan with unlimited flashcards, sets, and core study features like SRS and progress tracking. We also offer Premium plans (monthly/yearly) that unlock advanced AI features (flashcard/plan generation, AI summaries) and support the app's development. See our Pricing Section above for details.",
    },
    {
      question: 'Do I need an account to use the app?',
      answer:
        'You can create and study flashcards as a guest, storing data locally on your device. However, creating a free account (using Google or GitHub) is required to synchronize your data across devices, back it up to our self-hosted cloud infrastructure (using Supabase software on Hetzner), and access AI features (Premium required for AI generation).',
    },
    {
      question: 'How is my data stored and synced?',
      answer:
        "Your flashcards, sets, progress, and other study data are primarily stored locally in your browser's IndexedDB (using Dexie.js). This allows for offline access to your existing data. If you are logged in, this local data is automatically synchronized with our secure, self-hosted cloud database (using Supabase software running on Hetzner infrastructure) to provide backup and allow you to access your information across different devices.",
    },
    {
      question: 'Can I use Final Phase offline?',
      answer:
        'Yes, to some extent. Final Phase is a Progressive Web App (PWA). Once the app is loaded and your data is stored locally (in IndexedDB), you can review existing flashcards, sets, and plans offline. However, features requiring AI processing (like generation), data synchronization between devices, or initial login require an active internet connection.',
    },
    {
      question: 'How is my data used? (Privacy)',
      answer:
        "We prioritize your privacy. Your study content (flashcards, sets, etc.) is stored locally and, if logged in, synced securely to our self-hosted database (using Supabase software on Hetzner infrastructure) for backup/cross-device use. When using AI features, relevant content (like topics or prompts) is sent to Google's AI API only for generating the requested output; Google does not use this API data for training their models. We use privacy-focused Umami Analytics for anonymized usage data to improve the app. We do not sell your personal data. Please see our Privacy Policy for full details.",
    },
    {
      question: 'How do notifications work?',
      answer:
        "If you grant permission, the app can send you push notifications for study reminders you set. We store your browser's push subscription details securely in our self-hosted database (using Supabase software on Hetzner infrastructure) to enable this. You can revoke permission anytime in your browser or operating system settings. We only use notifications for reminders you configure or essential app updates.",
    },
    {
      question:
        'What\'s the difference between "Clear Local Data" and "Delete Account"?',
      answer:
        '"Clear Local Data" (in Settings > Danger Zone) removes all flashcards, sets, stats, etc., stored only on your current device\'s browser. It does not affect data synced to the cloud if you are logged in. "Delete Account" (in Settings > Danger Zone) is permanent. It removes your user account and all associated data (flashcards, sets, progress, etc.) from our self-hosted cloud database (using Supabase software on Hetzner infrastructure). Your local data on devices won\'t be automatically cleared but will no longer sync.',
    },
    {
      question: 'How can I provide feedback or suggest features?',
      answer:
        'We love hearing from our users! You can submit feedback directly through the "Feedback" section in the app or contact us via the email provided in the "Contact" section on this page.',
    },
  ];

  const listItem = (text: string, done?: boolean) => (
    <li className='flex gap-2'>
      {done ? (
        <Check className='flex size-6 min-w-6 text-green-500' />
      ) : (
        <Dot className='flex size-6 min-w-6 text-green-500' />
      )}
      <span className='max-w-72 hyphens-auto'>{text}</span>
    </li>
  );

  const timelineItems = [
    {
      active: true,
      body: (
        <ul className='flex flex-col gap-2'>
          {listItem('Filters on flashcard list', true)}
          {listItem(
            'More detailed flashcard - real-world examples, key points, synonyms, related facts.',
            true,
          )}
          {listItem('More advanced spaced repetition algorithm', true)}
          {listItem('More customization options for generating with AI', true)}
          {listItem('Improved stats page', true)}
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
          {listItem('Generate sets from pdf/txt files')}
          {listItem('Export / Import flashcards to / from CSV')}
          {listItem('Community section with shared decks')}
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
          {listItem('Ai Agent to manage flashcard with simple chat')}

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
          <div className='flex h-[40px] items-center justify-center'>
            <Image
              src='/images/finalphase-logo.svg'
              alt='Flashcards Logo'
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

            <li>
              <LinkComponent
                href='/privacy-policy'
                className='text-sm'
              >
                Privacy Policy
              </LinkComponent>
            </li>

            <li>
              <LinkComponent
                href='/terms-of-service'
                className='text-sm'
              >
                Terms of Service
              </LinkComponent>
            </li>

            <li className='pl-8'>
              <Link href='/sign-in'>
                <Button
                  variant='primary-outline'
                  label='Get Started Free'
                  className='group mx-auto min-w-36 font-semibold'
                  icon={animatedPlayIcon}
                  iconPosition='right'
                  alt='Redirect to sign in page'
                />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='absolute bottom-0 left-0 right-0 top-0 h-[800px] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_20%,#000_70%,transparent_110%)]'></div>
      <div className='relative mx-auto flex h-auto min-h-full w-full max-w-7xl flex-col items-center justify-center gap-8 p-4 pt-20 md:pt-0 xl:gap-8'>
        {/* Hero section */}
        <div className='relative flex w-full max-w-2xl flex-col items-center justify-center gap-4 py-32 md:py-48'>
          <Image
            src='/images/finalphase-logo.svg'
            alt='Flashcards Logo'
            width={64}
            height={64}
          />

          <h1 className='flex flex-col items-center gap-4 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text p-2 text-center font-fredoka text-5xl !font-black text-transparent'>
            Reach your Final Phase of
            <span className='relative inline-block max-w-min px-4 before:absolute before:-inset-1 before:block before:-skew-y-3 before:rounded-sm before:bg-green-400'>
              <span className='relative z-10 text-slate-950'>learning.</span>
            </span>
          </h1>

          <div className='flex w-full items-center justify-center gap-4'>
            <p className='text-center text-lg text-slate-200'>
              Stop making flashcards, start mastering subjects. <br />{' '}
              AI-powered study tools for busy students.
            </p>
          </div>

          <Link href='/sign-in'>
            <Button
              variant='primary-outline'
              label='Get Started Free'
              className='group mx-auto mt-8 min-w-36 font-semibold'
              icon={animatedPlayIcon}
              iconPosition='right'
              alt='Redirect to sign in page'
            />
          </Link>

          <ScrollReveal className='hero-section-img mt-16 flex h-96 w-full items-center justify-center rounded-md object-cover md:object-contain'></ScrollReveal>
        </div>

        {/* Pain Points section */}
        <section className='container flex flex-col items-center justify-center gap-8 py-12'>
          <ScrollReveal>
            <h4 className='font-fredoka font-semibold text-slate-200'>
              Does this sound familiar?
            </h4>
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
                  <li className='relative flex w-full max-w-72 flex-col items-center justify-center gap-4 rounded-md  border  border-gray-900 p-4 text-center text-sm  text-slate-200 md:items-start  md:justify-start  md:text-left'>
                    <div className='absolute left-0 top-0 z-[2] h-full w-full  bg-[radial-gradient(#22c55e15_1px,transparent_1px)] bg-[size:20px_20px]'></div>
                    <div className='p-2'>{icon}</div>
                    <span>{body}</span>
                  </li>
                </ScrollReveal>
              ))}
            </m.ul>
          </div>
        </section>

        {/* Values section */}
        <section
          id='features'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <div className='absolute left-0 top-0 z-[2] h-full w-full bg-[radial-gradient(at_75%_60%,#7ed321_0px,transparent_50%),radial-gradient(at_64%_21%,#417505_0px,transparent_50%),radial-gradient(at_7%_69%,#417505_0px,transparent_50%)] opacity-20 blur-3xl'></div>
          <ScrollReveal className='z-10 flex flex-col items-center justify-center gap-4'>
            <h4 className='text-center font-fredoka font-semibold text-green-500'>
              That&apos;s why we built Final Phase <br />
            </h4>
            <span className='text-center text-slate-400'>
              The Place Where...
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
                    className='relative flex w-full max-w-72 flex-col items-center justify-center gap-4 rounded-md border border-gray-900 p-4 text-center text-sm text-slate-200 md:items-start  md:justify-start md:text-left'
                  >
                    <div className='absolute left-0 top-0 z-[2] h-full w-full  bg-[radial-gradient(#22c55e15_1px,transparent_1px)] bg-[size:20px_20px]'></div>
                    <div className='p-2'>{icon}</div>
                    <span className='z-10 rounded-md bg-black/5 p-2 backdrop-blur-md'>
                      {body}
                    </span>
                  </li>
                </ScrollReveal>
              ))}
            </m.ul>
          </div>
        </section>

        {/* CTA section */}
        <section className='container z-[2] flex flex-col items-center justify-start rounded-md py-6 backdrop-blur-md'>
          <ScrollReveal className='flex flex-col items-center gap-4'>
            <h4 className=' text-center font-fredoka font-semibold text-slate-200'>
              Ready to conquer your courses?
            </h4>
            <span className='text-slate-400'>
              Start learning smarter, not just harder.
            </span>
          </ScrollReveal>

          <ScrollReveal>
            <Link href='/sign-in'>
              <Button
                variant='primary-outline'
                label='Get Started Free'
                className='group mx-auto mt-8 min-w-36 font-semibold'
                icon={animatedPlayIcon}
                iconPosition='right'
                alt='Redirect to sign in page'
              />
            </Link>
          </ScrollReveal>
        </section>

        {/* Pricing section */}
        <section
          id='pricing'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <ScrollReveal className='flex flex-col items-center justify-center gap-4'>
            <h4 className='font-fredoka font-semibold text-green-500 '>
              Pricing
            </h4>
            <span className='text-center  text-slate-400'>
              Simple plans for every student. <br /> Upgrade anytime.
            </span>
          </ScrollReveal>

          <m.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={containerVariants}
            className='flex flex-wrap  justify-center gap-8 md:gap-4'
          >
            {/* Free */}
            <ScrollReveal variants={itemVariants}>
              <Card
                className='h-[580px] w-72'
                motion={false}
              >
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <h5 className='flex items-center justify-between text-xl font-bold'>
                      <span>Free</span>
                    </h5>

                    <p className='pb-5 text-sm text-slate-400'>
                      Get started, no credit card required.
                    </p>
                  </div>

                  <span className='flex flex-col items-center justify-center py-6'>
                    <span className='flex -translate-x-4 items-center text-7xl font-semibold '>
                      <DollarSign className='size-8 -translate-y-3 text-green-500' />
                      <span>0</span>
                    </span>

                    <span className='pt-2  text-slate-300'>per month</span>
                  </span>
                  <Link
                    href='/sign-in'
                    className='contents'
                  >
                    <Button
                      label={'Get started'}
                      variant={'primary-outline'}
                      className='font-bold'
                      alt='Redirect to pricing in page'
                    />
                  </Link>

                  <div className='h-[2px] w-full bg-slate-800'></div>

                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-slate-200'>
                      Free Includes:
                    </p>
                    <ul className='flex flex-col gap-2 text-sm text-slate-400'>
                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Unlimited flashcards</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Unlimited sets</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Spaced Repetition System</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Study Session Tracking</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span className='flex flex-col'>
                          <span>Advanced Study Statistics</span>
                          <span className='text-xs text-slate-500'>
                            (Incl. Focus Tracking)
                          </span>
                        </span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Cross-Device Sync</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </ScrollReveal>

            {/* Premium */}
            <ScrollReveal
              variants={itemVariants}
              className='relative'
            >
              <Card
                className='z-20 h-[580px] w-72'
                motion={false}
              >
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <h5 className='flex items-center justify-between text-xl font-bold'>
                      <span>Premium</span>
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Popular
                      </Badge>
                    </h5>
                    <p className='text-sm text-slate-400'>
                      Unlock AI Superpowers & Advanced Features
                    </p>
                  </div>

                  <span className='flex flex-col items-center justify-center py-6'>
                    <span className='flex -translate-x-4 items-center text-7xl font-semibold'>
                      <DollarSign className='size-8 -translate-y-3 text-green-500' />
                      <span>2.5</span>
                    </span>

                    <span className='pt-2 text-slate-300'>per month</span>
                  </span>

                  <Link
                    href={proLink.href}
                    className='contents'
                  >
                    <Button
                      label={'Unlock AI Features'}
                      variant={'primary-outline'}
                      className='font-bold'
                      type='submit'
                      alt='Redirect to pricing in page'
                    />
                  </Link>

                  <div className='h-[2px] w-full bg-slate-800'></div>

                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-slate-200'>
                      Everything in Free, plus:
                    </p>
                    <ul className='flex flex-col gap-2 text-sm text-slate-400'>
                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>AI Flashcard Generation</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>AI Study Plan Creation</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>AI Set Description Generation</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Access to all upcoming premium features</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
              <div className='radial-gradient absolute -left-[2px] -top-[2px] z-10 flex h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md opacity-30 content-[""]'></div>
            </ScrollReveal>

            {/* Yearly */}
            <ScrollReveal
              variants={itemVariants}
              className='relative'
            >
              <Card
                className='z-20 h-[580px] w-72 bg-transparent dark:bg-transparent'
                motion={false}
              >
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <h5 className='flex items-center justify-between text-xl font-bold'>
                      <span>Yearly Premium</span>
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Best Value
                      </Badge>
                    </h5>
                    <p className='text-sm text-slate-400'>
                      Unlock AI Superpowers & Advanced Features
                    </p>
                  </div>

                  <span className='flex flex-col items-center justify-center py-6'>
                    <span className='flex -translate-x-4 items-center text-7xl font-semibold'>
                      <DollarSign className='size-8 -translate-y-3 text-green-500' />
                      <span>25</span>
                    </span>

                    <span className='pt-2 text-slate-300'>annually</span>
                  </span>

                  <Link
                    href={proLink.href}
                    className='contents'
                  >
                    <Button
                      label={'Unlock AI Features'}
                      variant={'primary-outline'}
                      className='font-bold'
                      type='submit'
                      alt='Redirect to pricing in page'
                    />
                  </Link>

                  <div className='h-[2px] w-full bg-slate-800'></div>

                  <div className='flex flex-col gap-2'>
                    <p className='font-semibold text-slate-200'>
                      Everything in Free, plus:
                    </p>
                    <ul className='flex flex-col gap-2 text-sm text-slate-400'>
                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>AI Flashcard Generation</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>AI Study Plan Creation</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>AI Set Description Generation</span>
                      </li>

                      <li className='flex gap-2'>
                        <span>•</span>
                        <span>Access to all upcoming premium features</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
              <div className='radial-gradient absolute -left-[2px] -top-[2px] z-10 flex h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md opacity-30 content-[""]'></div>
            </ScrollReveal>
          </m.div>
        </section>

        {/* Roadmap section */}
        <section
          id='roadmap'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <div className='absolute left-0 top-0 z-[2] h-full w-full bg-[radial-gradient(at_20%_80%,#7ed321_0px,transparent_50%),radial-gradient(at_44%_41%,#417505_0px,transparent_50%),radial-gradient(at_90%_69%,#417505_0px,transparent_50%)] opacity-20 blur-3xl'></div>

          <ScrollReveal className='flex flex-col items-center justify-center gap-4'>
            <h4 className='font-fredoka font-semibold text-slate-200 '>
              Road Map
            </h4>
            <span className='text-center text-slate-400'>
              We&apos;re constantly evolving Final Phase based on your feedback.{' '}
              <br />
              Here&apos;s what&apos;s planned:
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

        {/* FAQ Section */}
        <section
          id='faq'
          className='container relative flex scroll-mt-16 flex-col items-center justify-center gap-8 py-12'
        >
          <ScrollReveal className='flex flex-col items-center justify-center gap-4'>
            <h4 className='font-fredoka font-semibold text-green-500'>
              Frequently Asked Questions
            </h4>
            <span className='text-center text-slate-400'>
              Got questions? We&apos;ve got answers.
            </span>
          </ScrollReveal>

          <ScrollReveal className='max-w-full'>
            <Accordion variant='default'>
              {faqItems.map((item, index) => (
                <Accordion.Item
                  key={`faq-item-${index}`}
                  title={item.question}
                  variant='default'
                >
                  <p className='text-sm text-slate-300'>{item.answer}</p>
                </Accordion.Item>
              ))}
            </Accordion>
          </ScrollReveal>
        </section>

        {/* Contact section */}
        <section
          id='contact'
          className='container z-[2] flex flex-col items-center justify-start gap-4 rounded-md  py-6 backdrop-blur-md'
        >
          <ScrollReveal className='flex flex-col items-center justify-center gap-2'>
            <h4 className=' font-fredoka font-semibold text-slate-200 '>
              Contact
            </h4>
            <span className='text-center text-slate-400'>
              Questions? Feedback? Reach out!
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
                href={'mailto:support@finalphase.app'}
                target='_blank'
                className='flex items-center gap-8 underline decoration-green-500 underline-offset-2'
              >
                <MailIcon className='size-6 text-green-500' />
                <span className=' text-slate-200'>support@finalphase.app</span>
              </Link>
            </ScrollReveal>
          </m.div>
        </section>

        <footer className='container relative flex flex-col items-center justify-center gap-8 border-t border-slate-800 py-8'>
          <div className='flex items-center justify-center gap-2'>
            <Image
              src={'/images/finalphase-logo.svg'}
              alt='Flashcards Logo'
              width={32}
              height={32}
            />

            <span
              className={`overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text px-2 font-fredoka text-xl font-black tracking-tight text-transparent transition-all`}
            >
              Final Phase
            </span>
          </div>

          <div className='flex flex-col items-center justify-center gap-4'>
            <div className='flex items-center justify-center gap-4 text-sm text-slate-400'>
              <Link
                href='/privacy-policy'
                className='hover:text-green-500'
                aria-label='Privacy Policy'
              >
                Privacy Policy
              </Link>
              <span>|</span>
              <Link
                href='/terms-of-service'
                className='hover:text-green-500'
                aria-label='Terms of Service'
              >
                Terms of Service
              </Link>
            </div>
            <span className='text-center text-sm text-slate-400'>
              © {new Date().getFullYear()} Final Phase. All rights reserved.
            </span>
          </div>

          <div className='flex items-center justify-center gap-4'>
            <Link
              href={'https://x.com/baldmanhimself'}
              target='_blank'
              aria-label='Final Phase on X/Twitter'
              className='flex items-center gap-8 rounded-full bg-slate-900/50 p-2 transition-colors hover:bg-slate-800'
            >
              {xLogo}
            </Link>

            <Link
              href={'https://github.com/kudziajaroslaw98'}
              target='_blank'
              aria-label='Final Phase on GitHub'
              className='flex items-center gap-8 rounded-full bg-slate-900/50 p-2 transition-colors hover:bg-slate-800'
            >
              <GithubIcon className='size-6 text-green-500' />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
