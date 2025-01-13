'use client';

import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import { botttsNeutral } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AvatarProps {
  className?: string;
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
  onClick?: () => void;
}

export default function AvatarComponent({
  className,
  text,
  imageSrc,
  imageAlt,
  onClick,
}: AvatarProps) {
  const [avatar, setAvatar] = useState('');
  const { avatarSeed: seed } = useAppContext();

  useEffect(() => {
    setAvatar(
      createAvatar(botttsNeutral, {
        seed: seed,
      }).toDataUri(),
    );
  }, [seed]);

  const firstLetters = text
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0].toUpperCase());

  return (
    <button
      onClick={() => onClick && onClick()}
      className={cn([
        'relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-slate-800 active:focus:scale-95 dark:bg-slate-800 dark:text-gray-100',
        'outline-none focus:ring focus:ring-green-400/50',
        className,
      ])}
    >
      {(imageSrc ?? avatar) ? (
        <Image
          src={imageSrc ?? avatar}
          alt={imageAlt || 'User avatar'}
          className='h-full w-full object-cover'
          fill
        />
      ) : (
        <span className='text-sm font-semibold text-slate-800 dark:text-gray-100'>
          {firstLetters}
        </span>
      )}
    </button>
  );
}
