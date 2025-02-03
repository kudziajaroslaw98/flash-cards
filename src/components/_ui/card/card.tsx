'use client';
import { cn } from '#/shared/utils/cn.util';
import {
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from 'motion/react';
import * as m from 'motion/react-m';
import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

export interface CardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  backgroundGradientWidth?: number;
  motion?: boolean;
}

export default function Card({
  backgroundGradientWidth,
  className,
  children,
  motion = true,
  ...props
}: PropsWithChildren<CardProps>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (
    clientX: number,
    clientY: number,
    currentTarget: EventTarget & HTMLElement,
  ) => {
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const lightBackground = useMotionTemplate`radial-gradient(${
    backgroundGradientWidth ?? 300
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }px circle at ${mouseX}px ${mouseY}px, rgb(226 226 226 / .3), transparent 60%)` as MotionValue<any>;
  const darkBackground = useMotionTemplate`radial-gradient(${
    backgroundGradientWidth ?? 300
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }px circle at ${mouseX}px ${mouseY}px, rgb(10 15 27 / .2), transparent 60%)` as MotionValue<any>;

  return (
    <div
      onMouseMove={(e) =>
        handleMouseMove(e.clientX, e.clientY, e.currentTarget)
      }
      className={cn([
        `text-default group relative flex flex-col gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-600 shadow-card transition-all dark:border-slate-800/40  dark:bg-slate-950 dark:text-slate-300 dark:shadow-card-dark `,
        'outline-none ring-green-400/50 focus-visible:ring',
        motion &&
          'active:scale-95 motion-safe:will-change-transform md:hover:translate-y-1 md:hover:shadow-card-hovered dark:md:hover:shadow-dark-card-hovered',
        className,
      ])}
      {...props}
    >
      <m.div
        className='pointer-events-none absolute inset-0 -z-10 flex opacity-0 transition-all group-hover:opacity-100 dark:hidden'
        style={{
          // TODO: check if its resolved in the future
          // https://github.com/motiondivision/motion/issues/2887
          // @ts-expect-error known typescript error even though its correct
          background: lightBackground,
        }}
      />

      <m.div
        className='pointer-events-none absolute inset-0 -z-10 hidden opacity-0 transition-all group-hover:opacity-100 dark:flex'
        style={{
          // TODO: check if its resolved in the future
          // https://github.com/motiondivision/motion/issues/2887
          // @ts-expect-error known typescript error even though its correct
          background: darkBackground,
        }}
      />
      {children}
    </div>
  );
}
