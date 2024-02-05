'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';

export interface DropdownParams<T> {
  items: T[];
  defaultValue: T;
  onChange: (_value: T) => void;
  labelByKey?: keyof T;
}

export interface DropdownItem<T> {
  label: string;
  item: T;
}

export default function DropdownComponent<T>(
  params: Readonly<DropdownParams<T>>,
) {
  const [items, setItems] = useState<DropdownItem<T>[]>();
  const [picked, setPicked] = useState<DropdownItem<T>>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dropdownItems: DropdownItem<T>[];

    if (params.labelByKey) {
      dropdownItems = params.items.map((item) => ({
        label: item[params.labelByKey as keyof T] as string,
        item,
      }));
    } else {
      dropdownItems = params.items.map((item) => ({
        label: item as string,
        item,
      }));
    }

    const pickedItem = dropdownItems.filter((item) =>
      isEqual(item.item, params.defaultValue),
    )[0];

    setItems(dropdownItems);
    setPicked(pickedItem);
  }, [params.items, params.defaultValue, params.labelByKey]);

  useEffect(() => {
    if (picked) {
      params.onChange(picked?.item);
    }
  }, [picked, params]);

  const changePickedItem = (pickedItem: DropdownItem<T>) => {
    setPicked(pickedItem);
    toggleDropdownVisibility();
  };

  const toggleDropdownVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div className='relative w-full max-w-80 sm:w-52 '>
      <div
        className={`group z-30 flex h-12 cursor-pointer items-center justify-center rounded-md border border-green-400 px-4 transition md:h-10 ${
          visible
            ? 'bg-green-400 text-gray-50 dark:bg-slate-600 dark:text-green-400'
            : 'text-green-400'
        }`}
        onClick={() => toggleDropdownVisibility()}
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
                className='flex h-12 w-full cursor-pointer items-center border-b px-4 py-2 font-semibold text-green-400 transition first:rounded-t-md last:rounded-b-md last:border-none hover:bg-green-400 hover:text-gray-50 md:h-10 dark:border-slate-700 dark:hover:bg-green-400 dark:hover:text-slate-100'
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
