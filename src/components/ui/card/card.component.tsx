import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { PropsWithChildren } from 'react';

export interface CardComponentProps {
  class?: string;
  backgroundGradientWidth?: number;
}

export default function CardComponent(
  props: PropsWithChildren<CardComponentProps>,
) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const handleMouseMove = (
    clientX: number,
    clientY: number,
    currentTarget: EventTarget & HTMLElement,
  ) => {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      onMouseMove={(e) =>
        handleMouseMove(e.clientX, e.clientY, e.currentTarget)
      }
      className={`group relative -z-0 flex cursor-pointer rounded-md border border-gray-50 bg-gray-100 p-4 transition-all active:scale-95 dark:border-slate-800 dark:bg-slate-900 ${
        props.class ?? ''
      }`}
    >
      <motion.div
        className='pointer-events-none absolute inset-0 -z-10 flex opacity-0 transition-all group-hover:opacity-100 dark:hidden'
        style={{
          background: useMotionTemplate`radial-gradient(${
            props.backgroundGradientWidth ?? 300
          }px circle at ${mouseX}px ${mouseY}px, rgb(226 226 226 / .6), transparent 60%)`,
        }}
      />

      <motion.div
        className='pointer-events-none absolute inset-0 -z-10 hidden opacity-0 transition-all group-hover:opacity-100 dark:flex'
        style={{
          background: useMotionTemplate`radial-gradient(${
            props.backgroundGradientWidth ?? 300
          }px circle at ${mouseX}px ${mouseY}px, rgb(10 15 27 / .6), transparent 60%)`,
        }}
      />

      {props.children}
    </div>
  );
}
