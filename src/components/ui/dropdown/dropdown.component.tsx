'use client';

import { DictionaryValue } from '#/shared/types/dictionary-value.type';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export interface DropdownParams<T> {
  config: Record<string, DictionaryValue<T>>;
  defaultValue: DictionaryValue<T>;
  onChange: (_value: DictionaryValue<T>['value']) => void;
}

export default function Dropdown<T>(
  params: Readonly<DropdownParams<T>>,
) {
  const [items, setItems] = useState<DictionaryValue<T>[]>();
  const [picked, setPicked] = useState<DictionaryValue<T>>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dropdownItems: DictionaryValue<T>[] = Object.values(
      params.config,
    ).map((item) => ({
      label: item.label,
      value: item.value,
    }));

    setItems(dropdownItems);
    setPicked(params.defaultValue);
  }, [params.config, params.defaultValue]);

  useEffect(() => {
    if (picked) {
      params.onChange(picked?.value);
    }
  }, [picked, params]);

  const changePickedItem = (pickedItem: DictionaryValue<T>) => {
    setPicked(pickedItem);
    toggleDropdownVisibility();
  };

  const toggleDropdownVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div className='relative w-full max-w-80 md:max-w-52'>
      <div
        className={`group z-30 flex h-11 cursor-pointer items-center justify-center rounded-md border border-green-400 px-4 transition ${
          visible
            ? 'bg-green-400 text-gray-50 dark:bg-slate-600 dark:text-green-400'
            : 'text-green-400'
        }`}
        onClick={toggleDropdownVisibility}
      >
        <label className='flex w-full cursor-pointer items-center justify-between gap-4 font-semibold'>
          <span className='text-inherit'>{picked?.label}</span>
          <span className='text-inherit'>
            <ChevronDownIcon className='h-4 w-4' />{' '}
          </span>
        </label>

        {visible && (
          <div className='absolute -top-2 left-0 z-20 mt-1 flex w-full -translate-y-[100%] animate-fade-in-to-top flex-col rounded-md border bg-gray-50 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-800'>
            {items?.map((item) => (
              <div
                className='flex h-11 w-full cursor-pointer items-center border-b px-4 py-2 font-semibold text-green-400 transition first:rounded-t-md last:rounded-b-md last:border-none hover:bg-green-400 hover:text-gray-50 dark:border-slate-700 dark:hover:bg-green-400 dark:hover:text-slate-100'
                key={item.label}
                onClick={() => changePickedItem(item)}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
