'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export interface LinkProps {
  href: string;
  label: string;
  icon?: ReactNode;
  class?: string;
  onClick?: () => void;
}

export default function LinkComponent(props: LinkProps) {
  const pathName = usePathname();

  return (
    <Link
      href={props.href}
      onClick={props.onClick}
      className={`group relative flex items-center justify-center text-green-500 underline-offset-2 transition-all hover:text-green-400 ${props.class} `}
    >
      <p className='flex items-center gap-2'>
        {props.icon && props.icon} {props.label}
      </p>

      {props.href === pathName && (
        <motion.span
          layoutId='link-underline'
          className={`absolute -left-4 h-full w-[2px] rounded bg-green-500 group-hover:bg-green-400`}
        ></motion.span>
      )}
    </Link>
  );
}
