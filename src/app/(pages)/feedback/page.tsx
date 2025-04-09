'use client';
import { Button } from '#/components/_ui/button/button';
import FormComponent, { FormMethods } from '#/components/form-component/form';
import useFetch from '#/hooks/use-fetch.hook';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { feedbackFormScheme } from '#/shared/validation-schemes/feedback-validation.scheme';
import { Feedback } from '#/types/feedback.type';
import { Send } from 'lucide-react';
import { useRef, useState } from 'react';

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
  const { fetch } = useFetch();

  const handleSubmit = async () => {
    setIsLoading(true);
    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      setIsLoading(false);
      return;
    }

    try {
      await fetch(API_ROUTES.FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formRef.current.value),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex w-full flex-col items-center gap-8'>
      <h4 className='font-fredoka font-semibold text-green-400'>
        Share Your Feedback
      </h4>
      <p className='max-w-lg text-center text-sm text-gray-500 dark:text-slate-400'>
        We value your input! Whether its a bug report, a feature suggestion, or
        general thoughts, let us know how we can improve Final Phase for you.
      </p>
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
          className='w-full max-w-md'
          alt='Send Feedback'
        />
      </div>
    </div>
  );
}
