'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren, ReactNode } from 'react';

export interface LinkProps {
  href: string;
  label?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  class?: string;
  onClick?: () => void;
}

export default function LinkComponent(props: PropsWithChildren<LinkProps>) {
  const pathName = usePathname();
  const isPathActive = props.href === pathName;

  const { href, label, icon, iconOnly, onClick } = props;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center justify-center underline-offset-2 transition-all hover:text-green-400 ${props?.class} ${isPathActive && 'text-green-400'} `}
    >
      <p className={`flex items-center ${iconOnly ? '' : 'gap-4'}`}>
        {icon && icon} {label && !iconOnly && label}
        {props?.children}
      </p>

      {isPathActive && (
        <motion.span
          layoutId='link-underline'
          className={` ${iconOnly ? '-bottom-1 left-[6px] h-1 w-2/3' : '-left-[11px] top-2 h-1/2 w-1'} absolute rounded bg-green-400 group-hover:bg-green-400`}
        ></motion.span>
      )}
    </Link>
  );
}
