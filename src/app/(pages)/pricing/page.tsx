'use client';

import Badge from '#/components/_ui/badge/badge';
import { Button } from '#/components/_ui/button/button';
import Card from '#/components/_ui/card/card';
import LinkComponent from '#/components/_ui/link/link';
import { useSessionContext } from '#/providers/session-provider.component';
import { DollarSign, MailIcon } from 'lucide-react';

export default function PricingPage() {
  const { isLoggedIn, pickedPlan, isPlanActive } = useSessionContext();

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
        <section className='flex flex-wrap justify-center gap-4'>
          <Card
            className='h-[580px] w-72'
            motion={false}
          >
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <h5 className='flex items-center justify-between text-xl font-bold'>
                  <span>Free</span>
                  {isLoggedIn && pickedPlan === null && (
                    <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                      Active
                    </Badge>
                  )}
                </h5>

                <p className='pb-5 text-sm text-gray-500 dark:text-slate-400'>
                  Get started, no credit card required.
                </p>
              </div>

              <span className='flex flex-col items-center justify-center py-6'>
                <span className='flex -translate-x-4 items-center text-7xl font-semibold '>
                  <DollarSign className='size-8 -translate-y-3 text-green-500' />
                  <span className='text-gray-800 dark:text-slate-100'>0</span>
                </span>

                <span className='pt-2 text-gray-500 dark:text-slate-300'>
                  per month
                </span>
              </span>

              <Button
                disabled={pickedPlan === null}
                label={pickedPlan === null ? 'Active' : 'Get started'}
                variant={'primary-outline'}
                className='font-bold'
                alt='Get started'
              />

              <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-800'></div>

              <div className='flex flex-col gap-2'>
                <p className='font-semibold text-gray-600 dark:text-slate-300'>
                  Free Includes:
                </p>
                <ul className='flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400'>
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
                      <span className='text-xs text-gray-400 dark:text-slate-500'>
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

          <form
            action={`/api/checkout-sessions/?plan=premium&payment=monthly`}
            method='POST'
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
                    {isLoggedIn && pickedPlan === 'premium' && isPlanActive && (
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Active
                      </Badge>
                    )}
                    {isLoggedIn && !isPlanActive && (
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Popular
                      </Badge>
                    )}
                  </h5>
                  <p className='text-sm text-gray-500 dark:text-slate-400'>
                    Unlock AI Superpowers & Advanced Features
                  </p>
                </div>

                <span className='flex flex-col items-center justify-center py-6'>
                  <span className='flex -translate-x-4 items-center text-7xl font-semibold'>
                    <DollarSign className='size-8 -translate-y-3 text-green-500' />
                    <span className='text-gray-800 dark:text-slate-100'>
                      2.5
                    </span>
                  </span>

                  <span className='pt-2 text-gray-500 dark:text-slate-300'>
                    per month
                  </span>
                </span>

                <Button
                  disabled={pickedPlan === 'premium' && isPlanActive}
                  label={
                    pickedPlan === 'premium' && isPlanActive
                      ? 'Active'
                      : 'Get started'
                  }
                  variant={'primary-outline'}
                  className='font-bold'
                  type='submit'
                  alt='Get started'
                />

                <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-800'></div>

                <div className='flex flex-col gap-2'>
                  <p className='font-semibold text-gray-600 dark:text-slate-300'>
                    Everything in Free, plus:
                  </p>
                  <ul className='flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400'>
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
          </form>

          <form
            action={`/api/checkout-sessions/?plan=premium&payment=yearly`}
            method='POST'
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
                    {isLoggedIn && pickedPlan === 'premium' && isPlanActive && (
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Active
                      </Badge>
                    )}
                    {isLoggedIn && !isPlanActive && (
                      <Badge className='h-6 px-2 py-0 text-xs font-normal'>
                        Best Value
                      </Badge>
                    )}
                  </h5>
                  <p className='text-sm text-gray-500 dark:text-slate-400'>
                    Unlock AI Superpowers & Advanced Features
                  </p>
                </div>

                <span className='flex flex-col items-center justify-center py-6'>
                  <span className='flex -translate-x-4 items-center text-7xl font-semibold'>
                    <DollarSign className='size-8 -translate-y-3 text-green-500' />
                    <span className='text-gray-800 dark:text-slate-100'>
                      25
                    </span>
                  </span>

                  <span className='pt-2 text-gray-500 dark:text-slate-300'>
                    annually
                  </span>
                </span>

                <Button
                  disabled={pickedPlan === 'premium' && isPlanActive}
                  label={
                    pickedPlan === 'premium' && isPlanActive
                      ? 'Active'
                      : 'Get started'
                  }
                  variant={'primary-outline'}
                  className='font-bold'
                  type='submit'
                  alt='Get started'
                />

                <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-800'></div>

                <div className='flex flex-col gap-2'>
                  <p className='font-semibold text-gray-600 dark:text-slate-300'>
                    Everything in Free, plus:
                  </p>
                  <ul className='flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400'>
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
