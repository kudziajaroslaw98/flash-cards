'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface LinkProps {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
}

export default function LinkComponent(props: LinkProps) {
  return (
    <Link
      href={props.href}
      className={`group relative flex items-center justify-center text-green-500 underline-offset-2 transition-all hover:text-green-400`}
    >
      <span className='flex gap-2'>
        {props.icon && props.icon} {props.label}
      </span>

      {props?.active && (
        <motion.span
          layoutId='link-underline'
          className={`absolute -bottom-1 h-[2px] w-full rounded bg-green-500 group-hover:bg-green-400`}
        ></motion.span>
      )}
    </Link>
  );
}
