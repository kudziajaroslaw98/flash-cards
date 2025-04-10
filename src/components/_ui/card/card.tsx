'use client';
import { cn } from '#/shared/utils/cn.util';
import type { HTMLMotionProps } from 'motion/react';
import * as m from 'motion/react-m';
import { PropsWithChildren } from 'react';

export interface CardProps extends HTMLMotionProps<'div'> {
  motion?: boolean;
}

export default function Card({
  className,
  children,
  motion = true,
  ...props
}: PropsWithChildren<CardProps>) {
  return (
    // @ts-expect-error motion error
    <m.div
      className={cn([
        `text-default group relative flex flex-col gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-600 transition-all dark:border-slate-800/40  dark:bg-slate-950 dark:text-slate-300`,
        'outline-none ring-green-400/50 focus-visible:ring',
        motion &&
          'active:scale-95 motion-safe:will-change-transform md:hover:translate-y-1',
        'border-b-4',
        className,
      ])}
      {...props}
    >
      {children}
    </m.div>
  );
}
