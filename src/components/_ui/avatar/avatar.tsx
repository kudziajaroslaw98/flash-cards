import { cn } from '#/shared/utils/cn.util';

interface AvatarProps {
  className?: string;
  text?: string;
  onClick?: () => void;
}

export default function AvatarComponent({
  className,
  text,
  onClick,
}: AvatarProps) {
  const firstLetters = text
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0].toUpperCase());

  return (
    <button
      onClick={() => onClick && onClick()}
      className={cn([
        'flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-slate-800 active:focus:scale-95 dark:bg-slate-800 dark:text-gray-100',
        className,
      ])}
    >
      {firstLetters}
    </button>
  );
}
