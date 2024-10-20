import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function DropdownLabel({
  selectedCount,
  label,
  multipleLabel,
  visible,
}: {
  selectedCount?: number;
  label: string;
  multipleLabel?: string;
  visible: boolean;
}) {
  return (
    <label className='flex w-full cursor-pointer items-center justify-between gap-4'>
      {selectedCount && selectedCount > 1 ? (
        <span className='flex gap-2 text-inherit'>
          <span>{selectedCount}</span>
          <span>{multipleLabel}</span>
        </span>
      ) : (
        <span className='text-inherit'>{label}</span>
      )}

      <span className='text-inherit'>
        <ChevronDownIcon
          className={`h-4 w-4 transition ${visible ? 'rotate-180' : ''}`}
        />
      </span>
    </label>
  );
}
