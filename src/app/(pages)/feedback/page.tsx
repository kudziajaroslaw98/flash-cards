'use client';
import { Button } from '#/components/_ui/button/button';
import Card from '#/components/_ui/card/card';
import FormComponent, { FormMethods } from '#/components/form-component/form';
import useFetch from '#/hooks/use-fetch.hook';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { cn } from '#/shared/utils/cn.util';
import { feedbackFormScheme } from '#/shared/validation-schemes/feedback-validation.scheme';
import { Feedback } from '#/types/feedback.type';
import { LoaderCircle, Send } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import * as m from 'motion/react-m';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useReward } from 'react-rewards';
import useMeasure from 'react-use-measure';

// export const metadata: Metadata = {
//   authors: [
//     { name: 'Final Phase', url: 'https://finalphase.app' },
//     { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
//   ],
//   creator: 'Jarosław Kudzia',
//   title: 'Feedback - Final Phase',
//   description:
//     'Share your thoughts and suggestions about the Final Phase app. Help us improve your learning experience!',
//   keywords: [
//     'feedback',
//     'suggestions',
//     'bug report',
//     'feature request',
//     'app feedback',
//     'user feedback',
//     'Final Phase feedback',
//   ],
//   openGraph: {
//     title: 'Feedback - Final Phase',
//     description:
//       'Share your thoughts and suggestions about the Final Phase app. Help us improve your learning experience!',
//     images: [
//       {
//         url: 'https://finalphase.app/og/og_image.png',
//         width: 800,
//         height: 600,
//       },
//     ],
//     url: 'https://finalphase.app/feedback',
//     siteName: 'Final Phase',
//     locale: 'en-US',
//     type: 'website',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Feedback - Final Phase',
//     description:
//       'Share your thoughts and suggestions about the Final Phase app. Help us improve your learning experience!',
//     images: [
//       {
//         url: 'https://finalphase.app/og/og_image.png',
//         width: 800,
//         height: 600,
//       },
//     ],
//   },
//   robots: {
//     index: false, // Usually don't want feedback pages indexed
//     follow: false,
//   },
//   applicationName: 'Final Phase',
//   alternates: {
//     canonical: 'https://finalphase.app/feedback',
//   },
//   manifest: '/manifest.json',
// };

export default function FeedbackPage() {
  const formRef = useRef<FormMethods<Feedback>>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<(unknown & { success: boolean }) | null>(
    null,
  );
  const { reward } = useReward('confettiReward', 'confetti');
  const { fetch, isLoading: submitIsLoading } = useFetch();

  const handleSubmit = async () => {
    setIsLoading(true);
    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      setIsLoading(false);
      return;
    }

    try {
      const fetchData: unknown & { success: boolean } = await fetch(
        API_ROUTES.FEEDBACK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formRef.current.value),
        },
      );
      setData(fetchData);
    } finally {
      setIsLoading(false);
    }
  };

  const animatedCheckIcon = () => {
    return (
      <m.svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
        className={'size-12 text-green-500'}
      >
        <m.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.2 }}
          d='M21.801 10A10 10 0 1 1 17 3.335'
        />
        <m.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
          d='m9 11 3 3L22 4'
        />
      </m.svg>
    );
  };

  useEffect(() => {
    if (data?.success) {
      reward();
    }
  }, [reward, data]);

  const [ref, { height }] = useMeasure();

  return (
    <div className='flex w-full flex-col items-center gap-8'>
      <h4 className='font-fredoka font-semibold text-green-400'>
        Share Your Feedback
      </h4>
      <p className='max-w-lg text-center text-sm text-gray-500 dark:text-slate-400'>
        We value your input! Whether its a bug report, a feature suggestion, or
        general thoughts, let us know how we can improve Final Phase for you.
      </p>
      <MotionConfig transition={{ duration: 0.1 }}>
        <Card
          initial={false}
          animate={{ height: height ? height : '100%' }}
          motion={false}
          className='flex w-full max-w-md overflow-hidden p-0'
        >
          <div
            ref={ref}
            className='flex w-full flex-col items-center justify-center p-8 px-8'
          >
            {!submitIsLoading ? (
              <>
                {data === null || data?.success === false ? (
                  <>
                    <FormComponent<Feedback>
                      ref={formRef}
                      scheme={feedbackFormScheme}
                      className='w-full max-w-md px-4'
                    />
                    <div className='flex w-full max-w-md flex-col items-center justify-center gap-4 px-4'>
                      <Button
                        label='Send Feedback'
                        icon={<Send className='size-4' />}
                        onClick={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                        className='mt-4 w-full max-w-md'
                        alt='Send Feedback'
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex w-full flex-col items-center gap-4'>
                      {animatedCheckIcon()}
                      <h4 className={cn(['text-green-500'])}>Feedback sent</h4>
                      <p className='flex flex-col text-center text-sm text-gray-500 dark:text-slate-400'>
                        <span>Your feedback was saved successfully!</span>
                        <span>Thank you for your time!</span>
                      </p>

                      <Link
                        href='/flashcards/learn'
                        className='contents'
                      >
                        <Button
                          variant={'secondary'}
                          label={'Continue Learning'}
                          alt='Redirect to flashcards page'
                          className='mt-4 w-full max-w-md'
                        />
                      </Link>
                    </div>
                    {data?.success && <span id='confettiReward' />}
                  </>
                )}
              </>
            ) : (
              <div className='flex flex-col items-center justify-center gap-4 py-4'>
                <p className='text-sm text-gray-500 dark:text-slate-400'>
                  Sending your feedback...
                </p>
                <LoaderCircle className='size-12 animate-spin text-green-500' />
              </div>
            )}
          </div>
        </Card>
      </MotionConfig>
    </div>
  );
}
