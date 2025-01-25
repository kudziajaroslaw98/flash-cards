'use client';

import type { Variants } from 'motion/react';
import * as m from 'motion/react-m';

const MenuIcon = ({ animate }: { animate?: boolean }) => {
  const line1Variants: Variants = {
    normal: {
      rotate: 0,
      y: 0,
      opacity: 1,
    },
    animate: {
      rotate: '45deg',
      y: 6,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };
  const line2Variants: Variants = {
    normal: {
      rotate: 0,
      y: 0,
      opacity: 1,
    },
    animate: {
      rotate: 0,
      y: 0,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };
  const line3Variants: Variants = {
    normal: {
      rotate: 0,
      y: 0,
      opacity: 1,
    },
    animate: {
      rotate: -45,
      y: -6,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <div className='hover:bg-accent flex cursor-pointer select-none items-center justify-center rounded-md p-2 transition-colors duration-200'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <m.line
          x1='4'
          y1='6'
          x2='20'
          y2='6'
          initial='normal'
          variants={line1Variants}
          animate={animate ? 'animate' : 'normal'}
        />
        <m.line
          x1='4'
          y1='12'
          x2='20'
          y2='12'
          initial='normal'
          variants={line2Variants}
          animate={animate ? 'animate' : 'normal'}
        />
        <m.line
          x1='4'
          y1='18'
          x2='20'
          y2='18'
          initial='normal'
          variants={line3Variants}
          animate={animate ? 'animate' : 'normal'}
        />
      </svg>
    </div>
  );
};

export { MenuIcon };
