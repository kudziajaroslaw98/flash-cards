'use client';

import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import { DictionaryValue } from '#/types//dictionary-value.type';
import { cva, VariantProps } from 'class-variance-authority';
import { Search } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../button/button';
import Input from '../input/input';
import DropdownItem from './dropdown-item';
import DropdownLabel from './dropdown-label';

const DropdownVariants = cva(
  `absolute flex-col overflow-visible rounded-md border dark:border-slate-900/95 dark:bg-slate-950 flex w-full min-w-fit bg-gray-50/95 backdrop-blur-lg`,
  {
    variants: {
      contextPosition: {
        top: 'left-0 -top-2 data-[open=true]:z-30 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        'top-right':
          'right-0 -top-2 data-[open=true]:z-30 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        'top-left':
          'left-0 -top-2 data-[open=true]:z-30 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        bottom:
          'left-0 -bottom-2 data-[open=true]:!z-30 data-[open=true]:animate-fade-in-to-bottom data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-top',
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
  addNew?: boolean;
  // Form Control Props
  controlLabel?: string;
  touched?: boolean;
  valid?: boolean;
  required?: boolean;
  error?: string | null;
  onBlur?: () => void;
  onFocus?: () => void;
  onAddNew?: (value: string) => void;
  name?: string;
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
  onAddNew,
  error = null,
  touched = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type = 'dropdown',
  ...props
}: Readonly<DropdownProps<T>>) {
  const [items, setItems] = useState<DictionaryValue<T>[]>([]);
  const [selected, setSelected] = useState<DictionaryValue<T>[]>([]);
  const [visible, setVisible] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState<DictionaryValue<T>[]>();
  const [isSearching, setIsSearching] = useState(false);

  const [isInAddNewMode, setIsInAddNewMode] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');

  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<DictionaryValue<T>[] | null>(null);
  const valueRef = useRef<T | T[] | null | undefined>(null);

  useOutsideAlerter(dropdownWrapperRef, () => {
    if (visible) {
      window.umami.track('Dropdown - Click outside');
      setVisible(false);
      setSearchValue('');
      if (onBlur) {
        onBlur();
      }
    }
  });

  useEffect(() => {
    if (
      config.length === 0 ||
      (configRef.current !== null && !isDifferent(config, configRef.current))
    ) {
      return;
    }
    configRef.current = config;
    valueRef.current = value ?? null;

    setItems(config);
  }, [config]);

  useEffect(() => {
    if (
      configRef.current === null ||
      (valueRef.current !== null && !isDifferent(value, valueRef.current))
    ) {
      return;
    }
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    setFilteredItems(
      items?.filter((item) =>
        item.label
          ?.toLocaleLowerCase()
          ?.includes(searchValue?.toLocaleLowerCase()),
      ),
    );

    setSelected(
      items.filter((item) => {
        if (Array.isArray(valueRef.current)) {
          if (
            valueRef.current.some((value) => !isDifferent(value, item.value))
          ) {
            return true;
          }
        } else {
          return item.value === valueRef.current;
        }
      }),
    );
  }, [items, searchValue]);

  useEffect(() => {
    if (searchValue !== '') {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchValue]);

  const toggleDropdown = () => {
    window.umami.track('Dropdown - Toggle', { name: props.name ?? label });
    setVisible((prev) => !prev);
    setSearchValue('');
  };

  const changePickedItem = (pickedItem: DictionaryValue<T>) => {
    window.umami.track('Dropdown - Select item', {
      name: pickedItem.label,
    });
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

  const clearPicked = (key?: string) => {
    window.umami.track('Dropdown - Clear picked', { key: key ?? 'btnClick' });
    setSelected([]);

    if (multiple) {
      onChange([]);
    }
  };

  const handleSearchValueChange = (event: FormEvent<HTMLInputElement>) => {
    setSearchValue(event.currentTarget?.value);
  };

  const handleClickOnDropdown = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleToggleAddNew = (key?: string, type?: 'Cancel') => {
    window.umami.track('Dropdown - add new clicked', {
      key: key ?? 'btnClick',
      type: type ?? 'add',
    });
    setIsInAddNewMode((prev) => !prev);
  };

  const handleAddNewElement = (key?: string) => {
    window.umami.track('Dropdown - new element added', {
      key: key ?? 'btnClick',
    });
    const newItem = {
      value: newItemValue,
      label: newItemValue,
    } as DictionaryValue<T>;

    if (onAddNew) {
      onAddNew(newItemValue);
    }

    setItems((prev) => [...prev, newItem]);
    setIsInAddNewMode(false);
    setNewItemValue('');

    if (multiple) {
      setSelected((prev) => [...prev, newItem]);
      onChange([...selected, newItem].map((item) => item.value));
    } else {
      onChange(newItem.value);
      setSelected([newItem]);
    }
  };

  const handleNewElementChange = (event: FormEvent<HTMLInputElement>) => {
    setNewItemValue(event.currentTarget.value);
  };

  return (
    <div
      ref={dropdownWrapperRef}
      className={cn([
        'group relative z-40 flex w-full max-w-md flex-col',
        controlLabel ? 'pt-2' : '',
        labelClassName ?? '',
      ])}
    >
      {controlLabel && (
        <span
          className={cn([
            touched && !valid ? '!text-red-400' : '',
            touched && valid ? '!text-green-400' : '',
            'w-auto pb-2  pl-2 text-sm text-gray-400',
          ])}
        >
          {`${controlLabel}${required ? ' *' : ' (optional)'}`}
        </span>
      )}
      <div className='w-full'>
        <div
          className={cn([
            'group relative z-10 flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm outline-none focus:ring focus:ring-green-400/50',
            'transition',
            selected.length > 0
              ? 'border-green-500 text-green-500'
              : 'border-gray-300  text-gray-500 dark:border-slate-800 ',
            error ? 'border-red-400 text-red-400 dark:border-red-400' : '',
          ])}
          onClick={() => {
            handleClickOnDropdown();
            toggleDropdown();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handleClickOnDropdown();
              toggleDropdown();
            }
          }}
          tabIndex={0}
        >
          {multiple ? (
            <DropdownLabel
              onClick={() => {}}
              visible={visible}
              selectedCount={selected.length}
              label={selected[0]?.label ?? label}
              multipleLabel={multipleLabel}
            />
          ) : (
            <DropdownLabel
              onClick={() => {}}
              visible={visible}
              label={selected[0]?.label ?? label}
            />
          )}
        </div>
        {visible && (
          <div
            data-open={visible}
            className={cn([
              DropdownVariants({ contextPosition }),
              'border border-gray-300  dark:border-slate-950 ',
            ])}
          >
            {props.searchable && (
              <div className='min-w-fit rounded-t-md border-b bg-gray-100 p-1 dark:border-slate-800/40 dark:bg-slate-900 '>
                <Input
                  type='text'
                  value={searchValue}
                  valid={true}
                  placeholder={`Search in ${multipleLabel ?? label}...`}
                  name='search'
                  icon={<Search className='h-4 w-4' />}
                  className='min-w-52 text-sm'
                  onInput={handleSearchValueChange}
                  tabIndex={0}
                />
              </div>
            )}
            <div
              tabIndex={-1}
              className={cn([
                'max-h-52 overflow-y-auto p-2',
                (props.searchable || props.clearAll) &&
                  items?.length > 0 &&
                  'py-3',
              ])}
            >
              {isSearching &&
                filteredItems?.map((item, index) => (
                  <DropdownItem<T>
                    key={`dropdown_item_${item.value}_${index}`}
                    item={item}
                    selected={selected}
                    changePickedItem={changePickedItem}
                    selectable={!!multiple}
                  />
                ))}
              {!isSearching &&
                items?.map((item, index) => (
                  <DropdownItem<T>
                    key={`dropdown_item_${item.value}_${index}`}
                    item={item}
                    selected={selected}
                    changePickedItem={changePickedItem}
                    selectable={!!multiple}
                  />
                ))}
            </div>
            {props.addNew && !isInAddNewMode && (
              <div
                className='flex h-11 w-full cursor-pointer items-center justify-center border-t bg-gray-100  px-4 py-2 text-gray-500 outline-none transition hover:text-green-400 focus:ring focus:ring-green-400/50  dark:border-slate-800/40 dark:bg-slate-900'
                onClick={() => handleToggleAddNew()}
                onKeyDown={(event) =>
                  event.key === 'Enter' && handleToggleAddNew('Enter')
                }
                tabIndex={0}
              >
                Add new
              </div>
            )}
            {props.addNew && isInAddNewMode && (
              <div>
                <div className='min-w-fit  bg-gray-100 p-1 py-2 outline-none focus:ring  focus:ring-green-400/50 dark:border-slate-800/40 dark:bg-slate-900'>
                  <Input
                    type='text'
                    value={newItemValue}
                    valid={true}
                    placeholder='New element...'
                    for='new_element'
                    className='min-w-52 text-sm'
                    onInput={handleNewElementChange}
                    onKeyDown={(event) =>
                      event.key === 'Enter' && handleAddNewElement('Enter')
                    }
                    tabIndex={0}
                  />
                </div>

                <div className='flex h-11 w-full cursor-pointer items-center justify-center gap-2 border-t bg-gray-100 px-4 py-6 text-gray-500 transition hover:text-green-400 dark:border-slate-800/40  dark:bg-slate-900'>
                  <Button
                    label='Cancel'
                    onClick={() => handleToggleAddNew()}
                    onKeyDown={(event) =>
                      event.key === 'Enter' &&
                      handleToggleAddNew('Enter', 'Cancel')
                    }
                    variant={'destructive-outline'}
                    size={'sm'}
                    className='!w-full'
                    alt='Cancel'
                  />

                  <Button
                    label='Add'
                    onClick={() => handleAddNewElement()}
                    onKeyDown={(event) =>
                      event.key === 'Enter' && handleAddNewElement('Enter')
                    }
                    variant={'primary'}
                    size={'sm'}
                    className='!w-full'
                    alt='Add new element'
                  />
                </div>
              </div>
            )}

            {props.clearAll && (
              <div
                className='flex h-11 w-full cursor-pointer items-center justify-center rounded-b-md border-t bg-gray-100 px-4 py-2 text-gray-500 outline-none transition  hover:text-green-400 focus:ring  focus:ring-green-400/50 dark:border-slate-800/40 dark:bg-slate-900'
                onClick={() => clearPicked()}
                onKeyDown={(event) =>
                  event.key === 'Enter' && clearPicked('Enter')
                }
                tabIndex={0}
              >
                Clear All
              </div>
            )}
          </div>
        )}
      </div>

      <span
        className={`${
          error ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        } px-6 text-sm text-red-400 transition-all duration-700 ease-in-out`}
      >
        {error}
      </span>
    </div>
  );
}
