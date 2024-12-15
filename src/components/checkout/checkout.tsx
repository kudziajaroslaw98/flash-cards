'use client';
import { Button } from '../_ui/button/button';
import { cn } from '#/shared/utils/cn.util';
import * as m from 'framer-motion/m';
import Card from '../_ui/card/card';
import { useState } from 'react';
import Link from 'next/link';
function Checkout({
  success,
  cancel,
}: {
  success?: string | null;
  cancel?: string | null;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
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

  const animatedCancelIcon = () => {
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
        className={'size-12 text-yellow-500'}
      >
        <m.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.2 }}
          cx='12'
          cy='12'
          r='10'
        />
        <m.line
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.2 }}
          x1='9'
          x2='15'
          y1='15'
          y2='9'
        />
      </m.svg>
    );
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.2 }}
      className='flex h-full w-full items-center justify-center md:items-start'
    >
      <Card
        className='flex w-full max-w-md items-center justify-center p-8'
        motion={false}
      >
        <div className='flex w-full flex-col items-center gap-4'>
          {success && animatedCheckIcon()}
          {cancel && animatedCancelIcon()}

          <h4
            className={cn([
              success && 'text-green-500',
              cancel && 'text-yellow-500',
            ])}
          >
            {success && 'Payment successful'}
            {cancel && 'Payment canceled'}
          </h4>

          <p className='flex flex-col text-center text-sm text-gray-500 dark:text-slate-400'>
            {success && (
              <>
                <span>Congratulations, your payment was successful!</span>
                <span>You have now access to all premium features.</span>
              </>
            )}
            {cancel && (
              <>
                <span>Your payment was canceled.</span>
                <span>You can always do it again now or in the future.</span>
              </>
            )}
          </p>
        </div>

        <div className='flex w-full flex-col items-center gap-4 pt-8'>
          {cancel && (
            <form
              action={`/api/checkout-sessions/?plan=standard`}
              method='POST'
              className='contents'
            >
              <Button
                type='submit'
                disabled={isRedirecting}
                variant={'primary'}
                size={'full'}
                label={'Back to Checkout'}
              />
            </form>
          )}

          <Link
            href='/flashcards/learn'
            className='contents'
          >
            <Button
              disabled={isRedirecting}
              variant={'secondary-outline'}
              size={'full'}
              label={'Continue Learning'}
              onClick={() => setIsRedirecting(true)}
            />
          </Link>
        </div>
      </Card>
    </m.div>
  );
}

export default Checkout;
