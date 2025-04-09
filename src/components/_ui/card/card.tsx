'use client';
import { cn } from '#/shared/utils/cn.util';
import { useMotionValue } from 'motion/react';
import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

export interface CardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  backgroundGradientWidth?: number;
  motion?: boolean;
}

export default function Card({
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

  return (
    <div
      onMouseMove={(e) =>
        handleMouseMove(e.clientX, e.clientY, e.currentTarget)
      }
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
    </div>
  );
}
