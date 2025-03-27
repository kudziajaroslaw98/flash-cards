import { cn } from '#/shared/utils/cn.util';
import { DictionaryValue } from '#/types//dictionary-value.type';

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
        window?.umami?.track('Select dropdown item', { key: event.key });
        changePickedItem(item);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={cn([
        'flex h-auto w-full cursor-pointer items-center gap-4 rounded-md border border-gray-200 px-4 py-2 text-gray-500 !outline-none transition dark:border-slate-900',
        'hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-slate-900 dark:hover:text-gray-300',
        'focus:bg-gray-100 focus:ring  focus:ring-green-400/50  dark:focus:bg-slate-900',
        isSelected && 'text-green-400',
      ])}
      onClick={() => changePickedItem(item)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {selectable && (
        <span
          className={`${isSelected ? 'border-green-500 bg-green-400 text-gray-50 dark:text-slate-900' : 'border-gray-300 bg-gray-200 dark:border-slate-800 dark:bg-slate-900'} flex h-5 min-h-5 w-5 min-w-5 items-center justify-center rounded-md border text-sm `}
        >
          {isSelected && '✓'}
        </span>
      )}
      <span className='h-auto'>{item.label}</span>
    </div>
  );
}
