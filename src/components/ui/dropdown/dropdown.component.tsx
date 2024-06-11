'use client';

import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { DictionaryValue } from '#/shared/types/dictionary-value.type';
import { cn } from '#/shared/utils/cn.util';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { cva, VariantProps } from 'class-variance-authority';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Input from '../input/input.component';
import DropdownItem from './dropdown-item.component';
import DropdownLabel from './dropdown-label.component';

const DropdownVariants = cva(
  `absolute flex-col overflow-clip rounded-md border dark:border-slate-800 dark:bg-slate-800 flex w-full min-w-fit bg-gray-50/95 backdrop-blur-lg`,
  {
    variants: {
      contextPosition: {
        top: 'left-0 -top-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        'top-right':
          'right-0 -top-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        'top-left':
          'left-0 -top-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        bottom:
          'left-0 -bottom-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-bottom data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-top',
      },
    },
    defaultVariants: {
      contextPosition: 'bottom',
    },
  },
);

interface BaseDropdownParams<T> extends VariantProps<typeof DropdownVariants> {
  config: Record<string, DictionaryValue<T>>;
  defaultValue?: DictionaryValue<T> | DictionaryValue<T>[];
  clearAll?: boolean;
  searchable?: boolean;
}

export type DropdownParams<T> =
  | (BaseDropdownParams<T> & {
      multiple?: false;
      label?: string;
      onChange: (_value: DictionaryValue<T>['value']) => void;
    })
  | (BaseDropdownParams<T> & {
      multiple: true;
      label: string;
      onChange: (_value: DictionaryValue<T>['value'][]) => void;
    });

export default function Dropdown<T>({
  multiple,
  label,
  defaultValue,
  config,
  onChange,
  contextPosition,
  ...props
}: Readonly<DropdownParams<T>>) {
  const [items, setItems] = useState<DictionaryValue<T>[]>();
  const [selected, setSelected] = useState<DictionaryValue<T>[]>([]);
  const [visible, setVisible] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState<DictionaryValue<T>[]>();
  const [isSearching, setIsSearching] = useState(false);

  const dropdownWrapperRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(dropdownWrapperRef, () => {
    setVisible(false);
    setSearchValue('');
  });

  useEffect(() => {
    const dropdownItems: DictionaryValue<T>[] = Object.values(config).map(
      (item) => ({
        label: item.label,
        value: item.value,
      }),
    );

    const defaultValueAsArray = Array(defaultValue)
      .flat(1)
      .map((item) => item?.value);

    setItems(dropdownItems);
    setSelected(
      dropdownItems.filter((item) => defaultValueAsArray.includes(item.value)),
    );
  }, [config, defaultValue]);

  useEffect(() => {
    if (multiple) {
      onChange(selected.map((item) => item.value));
    } else {
      onChange(selected[0]?.value);
    }
  }, [multiple, selected, onChange]);

  useEffect(() => {
    setFilteredItems(
      items?.filter((item) =>
        item.label
          .toLocaleLowerCase()
          .includes(searchValue.toLocaleLowerCase()),
      ),
    );
  }, [items, searchValue]);

  const openDropdown = () => {
    if (!visible) {
      setVisible(true);
      setSearchValue('');
    }
  };

  const changePickedItem = (pickedItem: DictionaryValue<T>) => {
    if (multiple) {
      const index = selected.findIndex(
        (item) => item.value === pickedItem.value,
      );

      if (index === -1) {
        setSelected((prev) => [...prev, pickedItem]);
      } else {
        setSelected(selected.filter((item) => item.value !== pickedItem.value));
      }
    } else {
      setVisible(false);
      setSelected([pickedItem]);
      setSearchValue('');
    }
  };

  const clearPicked = () => {
    setSelected([]);
  };

  const handleSearchValueChange = (event: FormEvent<HTMLInputElement>) => {
    setSearchValue(event.currentTarget?.value);

    if (event.currentTarget?.value !== '') {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  return (
    <div
      onClick={openDropdown}
      className='w-full max-w-80 md:max-w-52'
      ref={dropdownWrapperRef}
    >
      <div
        className={cn([
          'group relative z-10 flex h-10 cursor-pointer items-center justify-center rounded-md border',
          'px-4 transition ',
          selected.length > 0
            ? 'border-green-500 text-green-500'
            : 'border-gray-300  text-gray-500 dark:border-slate-800 ',
        ])}
      >
        {multiple ? (
          <DropdownLabel
            visible={visible}
            selectedCount={selected.length}
            label={label}
          />
        ) : (
          <DropdownLabel
            visible={visible}
            label={selected[0]?.label ?? label}
          />
        )}

        {visible && (
          <div
            data-open={visible}
            className={cn([
              DropdownVariants({ contextPosition }),
              'text-gray-500',
            ])}
          >
            {props.searchable && (
              <div className='min-w-fit border-b bg-gray-100 p-1  dark:border-slate-800 dark:bg-slate-900 '>
                <Input
                  value={searchValue}
                  valid={true}
                  placeholder='Search in decks...'
                  for='search'
                  icon={<MagnifyingGlassIcon className='h-4 w-4' />}
                  className='min-w-52 text-sm'
                  onInput={handleSearchValueChange}
                  tabIndex={0}
                />
              </div>
            )}

            <div className={props.searchable || props.clearAll ? 'py-3' : ''}>
              {isSearching &&
                filteredItems?.map((item) => (
                  <DropdownItem<T>
                    key={item.label}
                    item={item}
                    selected={selected}
                    changePickedItem={changePickedItem}
                    selectable={!!multiple}
                  />
                ))}
              {!isSearching &&
                items?.map((item) => (
                  <DropdownItem<T>
                    key={item.label}
                    item={item}
                    selected={selected}
                    changePickedItem={changePickedItem}
                    selectable={!!multiple}
                  />
                ))}
            </div>

            {props.clearAll && (
              <div
                className='hover:text-green-40 flex h-11 w-full cursor-pointer items-center justify-center border-t bg-gray-100 px-4 py-2 text-gray-500 transition hover:text-gray-700  dark:border-slate-800 dark:bg-slate-900  dark:hover:text-gray-300'
                onClick={clearPicked}
                onKeyDown={(event) => event.key === 'Enter' && clearPicked()}
                tabIndex={0}
              >
                Clear All
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
