import { DictionaryValue } from '#/shared/types/dictionary-value.type';

export default function DropdownItem<T>({
  item,
  selected,
  selectable,
  changePickedItem,
}: {
  item: DictionaryValue<T>;
  selected?: DictionaryValue<T>[];
  selectable: boolean;
  changePickedItem: (item: DictionaryValue<T>) => void;
}) {
  const isSelected = selected?.includes(item);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        changePickedItem(item);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`${isSelected && 'text-green-400'} flex h-11 w-full cursor-pointer items-center gap-4 px-4 py-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700  dark:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-gray-300`}
      onClick={() => changePickedItem(item)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {selectable && (
        <span
          className={`${isSelected ? 'border-green-500 bg-green-400 text-gray-50 dark:text-slate-900' : 'border-gray-300 bg-gray-200 dark:border-slate-800 dark:bg-slate-900'} flex h-5 w-5 items-center justify-center rounded-md border text-sm `}
        >
          {isSelected && '✓'}
        </span>
      )}
      <span>{item.label}</span>
    </div>
  );
}
