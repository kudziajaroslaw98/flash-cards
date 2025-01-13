'use client';

import { cn } from '#/shared/utils/cn.util';
import { m } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren, ReactNode } from 'react';

export interface LinkProps {
  href: string;
  label?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  iconPosition?: 'left' | 'right';
  className?: string;
  underline?: boolean;
  onClick?: () => void;
}

export default function LinkComponent({
  href,
  label,
  icon,
  iconOnly,
  iconPosition = 'left',
  className,
  onClick,
  underline = true,
  ...props
}: PropsWithChildren<LinkProps>) {
  const pathName = usePathname();
  const isPathActive = pathName.includes(href);

  const handleClick = () => {
    window.umami.track('Click link', { href });
    if (onClick) onClick();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn([
        'group relative flex items-center justify-center underline-offset-2 outline-none transition-all hover:text-green-500 focus:ring focus:ring-green-400/50',
        className,
        isPathActive && 'text-green-400',
      ])}
    >
      <p
        className={cn([
          'flex items-center',
          !iconOnly && 'gap-4',
          iconPosition === 'right' && 'flex-row-reverse',
        ])}
      >
        {icon && icon} {label && !iconOnly && label}
        {props?.children}
      </p>

      {isPathActive && underline && (
        <m.span
          layoutId='link-underline'
          className={cn([
            iconOnly
              ? '-bottom-1 left-[6px] h-1 w-2/3'
              : '-left-[11px] top-2 h-1/2 w-1',
            'absolute rounded bg-green-400 group-hover:bg-green-400',
          ])}
        ></m.span>
      )}
    </Link>
  );
}
