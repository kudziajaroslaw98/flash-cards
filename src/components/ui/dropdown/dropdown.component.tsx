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

interface BaseDropdownProps<T> extends VariantProps<typeof DropdownVariants> {
  type?: 'dropdown';
  config: DictionaryValue<T>[];
  value?: T | T[];
  clearAll?: boolean;
  searchable?: boolean;
  labelClassName?: string;
  // Form Control Props
  controlLabel?: string;
  touched?: boolean;
  valid?: boolean;
  required?: boolean;
  error?: string | null;
  onBlur?: () => void;
  onFocus?: () => void;
}

export type DropdownProps<T> =
  | (BaseDropdownProps<T> & {
      multiple?: false;
      label?: string;
      multipleLabel?: string;
      onChange: (_value: DictionaryValue<T>['value']) => void;
    })
  | (BaseDropdownProps<T> & {
      multiple: true;
      label: string;
      multipleLabel: string;
      onChange: (_value: DictionaryValue<T>['value'][]) => void;
    });

export default function Dropdown<T>({
  multiple,
  multipleLabel,
  controlLabel,
  label,
  value,
  config,
  valid,
  required,
  contextPosition,
  labelClassName,
  onChange,
  onBlur,
  onFocus,
  error = null,
  touched = false,
  ...props
}: Readonly<DropdownProps<T>>) {
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

    if (onBlur) {
      onBlur();
    }
  });

  useEffect(() => {
    if (config.length === 0) return;
    const dropdownItems: DictionaryValue<T>[] = config;

    setItems(config);
    setSelected(
      dropdownItems.filter((item) => {
        if (Array.isArray(value)) {
          if (value.includes(item.value)) {
            return true;
          }
        } else if (item.value === value) {
          return true;
        }
        return false;
      }),
    );
  }, [config, value]);

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
        onChange([...selected, pickedItem].map((item) => item.value));
      } else {
        setSelected((prev) =>
          prev.filter((item) => item.value !== pickedItem.value),
        );
        onChange(
          selected
            .filter((item) => item.value !== pickedItem.value)
            .map((item) => item.value),
        );
      }
    } else {
      setVisible(false);
      setSelected([pickedItem]);
      setSearchValue('');

      onChange(pickedItem.value);
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

  const handleClickOnDropdown = () => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <label
      className={cn([
        'roup relative flex w-full max-w-md flex-col',
        controlLabel ? 'pt-2' : '',
        labelClassName ?? '',
      ])}
    >
      {controlLabel && (
        <span
          className={cn([
            touched && !valid ? '!text-red-400' : '',
            touched && valid ? '!text-green-400' : '',
            'w-auto pb-2 pl-2 text-gray-400',
          ])}
        >
          {`${controlLabel}${required ? '*' : ''}`}
        </span>
      )}
      <div
        onClick={openDropdown}
        className='w-full'
        ref={dropdownWrapperRef}
      >
        <div
          className={cn([
            'group relative z-10 flex h-10 cursor-pointer items-center justify-center rounded-md border',
            'px-4 transition ',
            selected.length > 0
              ? 'border-green-500 text-green-500'
              : 'border-gray-300  text-gray-500 dark:border-slate-800 ',
            error ? 'border-red-400 text-red-400 dark:border-red-400' : '',
          ])}
          onClick={handleClickOnDropdown}
        >
          {multiple ? (
            <DropdownLabel
              visible={visible}
              selectedCount={selected.length}
              label={selected[0]?.label ?? label}
              multipleLabel={multipleLabel}
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
                      key={`dropdown_item_${item.label}`}
                      item={item}
                      selected={selected}
                      changePickedItem={changePickedItem}
                      selectable={!!multiple}
                    />
                  ))}
                {!isSearching &&
                  items?.map((item) => (
                    <DropdownItem<T>
                      key={`dropdown_item_${item.label}`}
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

      <span
        className={`${
          error ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        } px-6 text-sm text-red-400 transition-all duration-700 ease-in-out`}
      >
        {error}
      </span>
    </label>
  );
}
