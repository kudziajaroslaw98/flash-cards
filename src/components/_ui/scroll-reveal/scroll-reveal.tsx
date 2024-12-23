import type { PropsWithChildren } from 'react';

type ScrollRevealProps = {
  variants?: {
    hidden: {
      opacity: number;
      y: number;
    };
    visible: {
      opacity: number;
      y: number;
    };
  };
  className?: string;
} & PropsWithChildren;
import * as m from 'framer-motion/m';
export const ScrollReveal = ({ variants, ...props }: ScrollRevealProps) => {
  const defaultVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <m.div
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      variants={variants ?? defaultVariants}
      initial={variants ? undefined : 'hidden'}
      whileInView={variants ? undefined : 'visible'}
      className={props.className ?? ''}
    >
      {props.children}
    </m.div>
  );
};
