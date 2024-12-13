import { cn } from '#/shared/utils/cn.util';

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn([
        'inline-flex items-center rounded-full border border-green-400 px-4 py-1 text-xs font-semibold text-green-400',
        className,
      ])}
    >
      {children}
    </span>
  );
};

Badge.defaultName = 'Badge';

export default Badge;
