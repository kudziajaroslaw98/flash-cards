import { cn } from '#/shared/utils/cn.util';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

export interface CardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  backgroundGradientWidth?: number;
}

export default function Card({
  backgroundGradientWidth,
  className,
  children,
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
        `text-default group relative flex cursor-pointer flex-col gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 shadow-card transition-all active:scale-95 dark:border-slate-800/40 dark:bg-slate-900 dark:shadow-card-dark md:hover:translate-y-1 md:hover:shadow-card-hovered dark:md:hover:shadow-dark-card-hovered`,
        className,
      ])}
      {...props}
    >
      <motion.div
        className='pointer-events-none absolute inset-0 -z-10 flex opacity-0 transition-all group-hover:opacity-100 dark:hidden'
        style={{
          background: useMotionTemplate`radial-gradient(${
            backgroundGradientWidth ?? 300
          }px circle at ${mouseX}px ${mouseY}px, rgb(226 226 226 / .2), transparent 60%)`,
        }}
      />

      <motion.div
        className='pointer-events-none absolute inset-0 -z-10 hidden opacity-0 transition-all group-hover:opacity-100 dark:flex'
        style={{
          background: useMotionTemplate`radial-gradient(${
            backgroundGradientWidth ?? 300
          }px circle at ${mouseX}px ${mouseY}px, rgb(10 15 27 / .2), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
