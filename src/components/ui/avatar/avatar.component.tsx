interface AvatarProps {
  avatarClass?: string;
  text?: string;
  onClick?: () => void;
}

export default function AvatarComponent(props: AvatarProps) {
  const { avatarClass, text, onClick } = props;

  const firstLetters = text
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0].toUpperCase());

  return (
    <button
      onClick={() => onClick}
      className={`flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-slate-800 active:focus:scale-95 dark:bg-slate-800 dark:text-gray-100 ${avatarClass ?? ''}`}
    >
      {firstLetters}
    </button>
  );
}
