import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function DropdownLabel({
  selectedCount,
  label,
  visible,
}: {
  selectedCount?: number;
  label: string;
  visible: boolean;
}) {
  return (
    <label className='flex w-full cursor-pointer items-center justify-between gap-4'>
      {selectedCount ? (
        <span className='flex gap-2 text-inherit'>
          <span>{selectedCount}</span>
          <span>{label}</span>
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
