import { cn } from '#/shared/utils/cn.util';

export type SeparatorProps = {
  type: '_internal_separator' | '_internal_divider';
  name: string;
  className?: string;
};

export function Separator({ type, name, className }: SeparatorProps) {
  return (
    <div
      role='separator'
      aria-orientation='horizontal'
      aria-label={name}
      tabIndex={-1}
      key={type + '-' + name}
      className={cn([
        'h-px w-full bg-slate-200 opacity-50 dark:bg-slate-900',
        className,
      ])}
    />
  );
}
