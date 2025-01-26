import { ChevronDown } from 'lucide-react';

export default function DropdownLabel({
  selectedCount,
  label,
  multipleLabel,
  visible,
  onClick,
}: {
  selectedCount?: number;
  label: string;
  multipleLabel?: string;
  visible: boolean;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className='pointer-events-none flex w-full cursor-pointer items-center justify-between gap-4 px-4'
    >
      {selectedCount && selectedCount > 1 ? (
        <span className='flex gap-2 text-inherit'>
          <span>{selectedCount}</span>
          <span>{multipleLabel}</span>
        </span>
      ) : (
        <span className='line-clamp-1 overflow-ellipsis text-inherit'>
          {label}
        </span>
      )}

      <span className='text-inherit'>
        <ChevronDown
          className={`h-4 w-4 transition ${visible ? 'rotate-180' : ''}`}
        />
      </span>
    </span>
  );
}
