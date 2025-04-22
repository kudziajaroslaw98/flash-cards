'use client';

import { Popover } from '#/components/popover/popover';
import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import { DictionaryValue } from '#/types//dictionary-value.type';
import { Eraser, Plus, Search } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../button/button';
import { FieldLabel } from '../field-label/field-label';
import Input from '../input/input';
import DropdownItem from './dropdown-item';
import DropdownLabel from './dropdown-label';

interface BaseDropdownProps<T> {
  type: 'dropdown';
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
  disabled?: boolean;
  loading?: boolean;
  contextClassName?: string;
  name?: string;
  nestedPopover?: boolean;
  contextPosition?: 'top' | 'bottom' | 'bottom-right';
}

export type DropdownProps<T> =
  | (BaseDropdownProps<T> & {
      multiple: false;
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
  multiple = false,
  multipleLabel,
  controlLabel,
  label,
  value,
  config,
  valid,
  required,
  labelClassName,
  contextClassName,
  onChange,
  onBlur,
  onFocus,
  onAddNew,
  error = null,
  touched = false,
  disabled = false,
  loading = false,
  nestedPopover = false,
  contextPosition = 'bottom',
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
  const popoverRef = useRef<{ handleTogglePopover: () => void } | null>(null);
  const dropdownLabelRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<DictionaryValue<T>[] | null>(null);
  const valueRef = useRef<T | T[] | null | undefined>(null);
  const popoverItemsEndRef = useRef<HTMLDivElement>(null);
  const hasFocus = useRef(false);

  useOutsideAlerter(dropdownWrapperRef, () => {
    if (visible) {
      window?.umami?.track('Dropdown - Click outside');
      setVisible(false);
      setSearchValue('');
      hasFocus.current = false;
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
        item?.label?.toLowerCase()?.includes(searchValue?.toLowerCase()),
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
    window?.umami?.track('Dropdown - Toggle', { name: props.name ?? label });
    if (disabled || loading) return;
    setVisible((prev) => !prev);
    setSearchValue('');
  };

  const changePickedItem = (pickedItem: DictionaryValue<T>) => {
    window?.umami?.track('Dropdown - Select item', {
      name: pickedItem.label,
    });
    if (multiple) {
      const index = selected.findIndex(
        (item) => item.value === pickedItem.value,
      );

      if (index === -1) {
        setSelected((prev) => [...prev, pickedItem]);
        onChange(
          [...selected, pickedItem].map((item) => item.value) as T & T[],
        );
      } else {
        setSelected((prev) =>
          prev.filter((item) => item.value !== pickedItem.value),
        );
        onChange(
          selected
            .filter((item) => item.value !== pickedItem.value)
            .map((item) => item.value) as T & T[],
        );
      }
    } else {
      setVisible(false);
      setSelected([pickedItem]);
      setSearchValue('');
      popoverRef.current?.handleTogglePopover();

      onChange(pickedItem.value as T & T[]);
    }
  };

  const clearPicked = (key?: string) => {
    window?.umami?.track('Dropdown - Clear picked', { key: key ?? 'btnClick' });
    setSelected([]);

    if (multiple) {
      onChange([] as T & T[]);
    }
  };

  const handleSearchValueChange = (event: FormEvent<HTMLInputElement>) => {
    setSearchValue(event.currentTarget?.value);
  };

  const handleClickOnDropdown = () => {
    hasFocus.current = true;
    if (onFocus) {
      onFocus();
    }
  };

  const handleToggleAddNew = (key?: string, type?: 'Cancel') => {
    window?.umami?.track('Dropdown - add new clicked', {
      key: key ?? 'btnClick',
      type: type ?? 'add',
    });
    setIsInAddNewMode((prev) => !prev);
  };

  const handleAddNewElement = (key?: string) => {
    window?.umami?.track('Dropdown - new element added', {
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
      onChange([...selected, newItem].map((item) => item.value) as T & T[]);
    } else {
      onChange(newItem.value as T & T[]);
      setSelected([newItem]);
    }

    setTimeout(() => {
      popoverItemsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  };

  const handleNewElementChange = (event: FormEvent<HTMLInputElement>) => {
    setNewItemValue(event.currentTarget.value);
  };

  return (
    <div
      ref={dropdownWrapperRef}
      className={cn([
        'group flex w-full max-w-md flex-col',
        controlLabel ? 'pt-2' : '',
        labelClassName ?? '',
        visible ? 'z-50' : 'z-40',
      ])}
      onFocus={handleClickOnDropdown}
    >
      {controlLabel && (
        <FieldLabel
          touched={touched}
          valid={valid ?? true}
          required={required ?? false}
          label={controlLabel}
        />
      )}

      <div className='w-full'>
        <Popover
          ref={popoverRef}
          trigger={
            <div
              ref={dropdownLabelRef}
              className={cn([
                'border-gray-300 text-gray-600 dark:border-slate-800 dark:text-slate-400',
                'group relative flex h-10 w-full cursor-pointer items-center justify-center rounded-md border text-sm outline-none group-has-[:focus]:ring',
                hasFocus.current ? 'ring' : '',
                'transition',
                touched && !valid
                  ? 'border-red-400 text-red-400 ring-red-400/50 dark:border-red-400'
                  : '',
                touched && valid
                  ? 'border-green-500 text-green-500 ring-green-400/50'
                  : '',
                error ? 'border-red-400 text-red-400 dark:border-red-400' : '',
                disabled
                  ? 'bg-gray-100 text-gray-200 dark:bg-slate-900 dark:text-slate-800'
                  : '',
              ])}
              onClick={(e) => {
                e.preventDefault();
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
                  visible={visible}
                  selectedCount={selected.length}
                  label={selected[0]?.label ?? label}
                  multipleLabel={multipleLabel}
                  loading={loading}
                />
              ) : (
                <DropdownLabel
                  onClick={() => {}}
                  visible={visible}
                  label={selected[0]?.label ?? label}
                  loading={loading}
                />
              )}
            </div>
          }
          position={contextPosition}
          nested={nestedPopover}
        >
          <div className='flex h-full w-full flex-col'>
            {props.searchable && (
              <div className='w-full min-w-fit rounded-t-md border-b p-2 dark:border-slate-800/40'>
                <Input
                  inputType='text'
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
                'flex w-full grow flex-col gap-1 overflow-y-auto p-2',
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
              <div
                ref={popoverItemsEndRef}
                className='flex size-[0.5px]'
              ></div>
            </div>

            {props.addNew && !isInAddNewMode && (
              <div
                className='flex h-11 w-full cursor-pointer items-center justify-center rounded-b-md border-t bg-gray-50 px-4 py-2 text-gray-500 outline-none transition hover:text-green-400 focus:ring focus:ring-green-400/50  dark:border-slate-800/40 dark:bg-slate-950'
                onClick={() => handleToggleAddNew()}
                onKeyDown={(event) =>
                  event.key === 'Enter' && handleToggleAddNew('Enter')
                }
                tabIndex={0}
              >
                <Plus className='mr-2 h-4 w-4' /> Add new
              </div>
            )}

            {props.addNew && isInAddNewMode && (
              <div>
                <div className='w-full min-w-fit bg-gray-50 p-1 py-2 outline-none focus:ring  focus:ring-green-400/50 dark:border-slate-800/40 dark:bg-slate-950'>
                  <Input
                    inputType='text'
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

                <div className='flex h-11 w-full cursor-pointer items-center justify-center gap-2 border-t bg-gray-50 px-4 py-6 text-gray-500 transition hover:text-green-400 dark:border-slate-800/40  dark:bg-slate-950'>
                  <Button
                    label='Cancel'
                    onClick={() => handleToggleAddNew()}
                    onKeyDown={(event) =>
                      event.key === 'Enter' &&
                      handleToggleAddNew('Enter', 'Cancel')
                    }
                    variant={'destructive-text'}
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
                    variant={'primary-text'}
                    size={'sm'}
                    className='!w-full'
                    alt='Add new element'
                  />
                </div>
              </div>
            )}

            {props.clearAll && (
              <div
                className='flex h-11 w-full cursor-pointer items-center justify-center rounded-b-md border-t bg-gray-50 px-4 py-2 text-gray-500 outline-none transition  hover:text-green-400 focus:ring  focus:ring-green-400/50 dark:border-slate-800/40 dark:bg-slate-950'
                onClick={() => clearPicked()}
                onKeyDown={(event) =>
                  event.key === 'Enter' && clearPicked('Enter')
                }
                tabIndex={0}
              >
                <Eraser className='mr-2 h-4 w-4' /> Clear All
              </div>
            )}
          </div>
        </Popover>
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
