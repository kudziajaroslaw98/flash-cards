'use client';

import useLocalStorage from '#/hooks/use-local-storage.hook';
import { botttsNeutral } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { cn } from '#/shared/utils/cn.util';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  className?: string;
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
  onClick?: () => void;
}

const generateHash = (text?: string): string => {
  if (!text) {
    return Math.random().toString(36);
  }

  // Use text to create a consistent hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

export default function AvatarComponent({ className, text, imageSrc, imageAlt, onClick }: AvatarProps) {
  const [avatar, setAvatar] = useState('');
  const { value: seed } = useLocalStorage({
    key: 'seed',
    defaultValue: {
      seed: generateHash(),
    },
  });

  useEffect(() => {
    setAvatar(
      createAvatar(botttsNeutral, {
        seed: seed.seed,
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
        <span className='text-sm font-semibold text-slate-800 dark:text-gray-100'>{firstLetters}</span>
      )}
    </button>
  );
}
