'use client';

import { useSessionContext } from '#/providers/session-provider.component';
import { Button } from '#/components/_ui/button/button';
import LinkComponent from '#/components/_ui/link/link';
import Badge from '#/components/_ui/badge/badge';
import Card from '#/components/_ui/card/card';
import { MailIcon } from 'lucide-react';

export default function PricingPage() {
  const { isLoggedIn, pickedPlan, isPlanActive } = useSessionContext();

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
        <section className='flex flex-wrap justify-center gap-4'>
          <Card className='w-72'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <h5 className='flex items-center justify-between text-2xl font-bold'>
                  <span>Free</span>
                  {isLoggedIn && pickedPlan === null && (
                    <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                      Active
                    </Badge>
                  )}
                </h5>

                <p className='text-sm text-gray-500 dark:text-slate-500'>
                  Free forever, no credit card required
                </p>
              </div>

              <span className='flex flex-col items-center justify-center py-6'>
                <span className='text-7xl font-semibold text-green-500'>
                  $0
                </span>

                <span className='pt-2 text-gray-500 dark:text-slate-500'>
                  per month
                </span>
              </span>

              <Button
                disabled={pickedPlan === null}
                label={pickedPlan === null ? 'Active' : 'Get started'}
                variant={'primary-outline'}
                className='font-bold'
              />

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

          <form
            action={`/api/checkout-sessions/?plan=standard`}
            method='POST'
          >
            <Card className='w-72'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <h5 className='flex items-center justify-between text-2xl font-bold'>
                    <span>Standard</span>
                    {isLoggedIn &&
                      pickedPlan === 'standard' &&
                      isPlanActive && (
                        <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                          Active
                        </Badge>
                      )}
                  </h5>
                  <p className='text-sm text-gray-500 dark:text-slate-500'>
                    Not creative today? We got you
                  </p>
                </div>

                <span className='flex flex-col items-center justify-center py-6'>
                  <span className='text-7xl font-semibold text-green-500'>
                    $2.5
                  </span>

                  <span className='pt-2 text-gray-500 dark:text-slate-500'>
                    per month
                  </span>
                </span>

                <Button
                  disabled={pickedPlan === 'standard' && isPlanActive}
                  label={
                    pickedPlan === 'standard' && isPlanActive
                      ? 'Active'
                      : 'Get started'
                  }
                  variant={'primary-outline'}
                  className='font-bold'
                  type='submit'
                />

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
          </form>
        </section>

        <section className='flex flex-col items-center justify-center py-8 text-gray-700 dark:text-slate-200'>
          <span>
            Do you want to{' '}
            <span className='font-semibold text-green-500'>
              support the project
            </span>{' '}
            even more?
          </span>

          <LinkComponent
            className='underline-green-500 mt-4 flex gap-2 pb-8 text-green-500 underline'
            href='mailto:jaroslawkudzia73@gmail.com'
          >
            <MailIcon className='h-4 w-4' />
            <span>Write to me</span>
          </LinkComponent>
        </section>
      </div>
    </div>
  );
}
