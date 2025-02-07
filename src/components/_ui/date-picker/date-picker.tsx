import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { useUpdatedFixPosition } from '#/hooks/use-updated-fix-position';
import { cn } from '#/shared/utils/cn.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Calendar } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button } from '../button/button';
import { DraggableScroll } from '../draggable-scroll/draggable-scroll';

export interface DateTimePickerProps {
  type: 'datetime-picker';
  label?: string;
  for?: string;
  valid: boolean;
  error?: string | null;
  touched?: boolean;
  icon?: React.ReactNode;
  value?: string;
  required?: boolean;
  className?: string;
  step?: number;
  onChange?: (date: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function DateTimePicker({
  for: forProp,
  label,
  valid,
  icon,
  value,
  onChange,
  onFocus,
  onBlur,
  required,
  step = 5,
  error = null,
  touched = false,
  className = '',
  type = 'datetime-picker',
}: DateTimePickerProps) {
  const hourColumnRef = useRef<HTMLDivElement | null>(null);
  const minuteColumnRef = useRef<HTMLDivElement | null>(null);
  const datePickerWrapper = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const valueRef = useRef<string | null>(null);

  const getParsedDate = (
    dateToParse: Date,
    hours?: number,
    minutes?: number,
  ) => {
    const date = new Date(
      dateToParse.getFullYear(),
      dateToParse.getMonth(),
      dateToParse.getDate(),
      hours ?? dateToParse.getHours(),
      minutes ?? dateToParse.getMinutes() - (dateToParse.getMinutes() % step),
      0,
      0,
    );
    return date;
  };

  const [date, setDate] = useState(getParsedDate(new Date()));
  const [calendar, setCalendar] = useState(getParsedDate(new Date()));
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Date[][]>([]);
  const [monthStart, setMonthStart] = useState(startOfMonth(date));

  // Calculate the calendar grid for the current month

  const scrollToSelected = (ref: RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const selected = ref.current.querySelector(
        `[aria-labelledby="active-item"]`,
      );
      if (selected) {
        selected.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'smooth',
        });
      }
    }
  };

  const handleDateClick = (
    selectedDay: Date,
    hours?: number,
    minutes?: number,
  ) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDay < today) return;

    const newDate = getParsedDate(selectedDay, hours, minutes);

    setDate(newDate);
    setCalendar(newDate);
    handleOnChange(newDate);
  };

  const handleOnChange = (newDate?: Date) => {
    if (onChange) {
      onChange((newDate ?? date).toUTCString());
    }
  };

  const handleOnFocus = () => {
    if (onFocus) onFocus();
  };

  const handleOnBlur = () => {
    setOpen(false);
    if (onBlur) onBlur();
  };

  const handleAcceptClick = () => {
    setOpen(false);
    handleOnChange();
  };

  const handleOnWrapperClick = () => {
    setOpen(!open);
    if (!open && onFocus) {
      onFocus();
    } else if (open && onBlur) {
      onBlur();
    }
  };

  useEffect(() => {
    if (open) {
      // Scroll to selected time
      scrollToSelected(hourColumnRef);
      scrollToSelected(minuteColumnRef);
    }
  }, [open, date]);

  useEffect(() => {
    const monthStart = startOfMonth(calendar);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
    let days = [];
    let day = calendarStart;
    const rows = [];

    while (day <= calendarEnd) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }

    setRows(rows);
    setMonthStart(monthStart);
  }, [calendar]);

  useEffect(() => {
    if (
      value === undefined ||
      (valueRef.current !== null &&
        !isDifferent(new Date(value).toISOString, date.toISOString()))
    ) {
      return;
    }
    valueRef.current = value;
    setDate(getParsedDate(new Date(value)));
    setCalendar(getParsedDate(new Date(value)));
  }, [value]);

  useOutsideAlerter(datePickerWrapper, () => {
    setOpen(false);
    if (onBlur) onBlur();
  });

  const { updatePopoverPosition } = useUpdatedFixPosition({
    visible: open,
    wrapperRef: datePickerWrapper,
    popoverRef,
  });

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col ${label ? 'pt-2' : ''} ${className ?? ''}`}
      htmlFor={forProp}
      aria-labelledby={type}
    >
      {label && (
        <span
          className={cn([
            touched && !valid ? '!text-red-400' : '',
            touched && valid ? '!text-green-400' : '',
            'w-auto pb-2 pl-2 text-sm text-gray-400',
          ])}
        >
          {`${label}${required ? ' *' : ' (optional)'}`}
        </span>
      )}

      <span
        className={cn([
          'flex h-10 w-full items-center gap-4 rounded-md border border-gray-300 transition-shadow has-[:focus]:ring  dark:border-slate-800',
          touched && !valid
            ? '!border-red-400 has-[:focus]:ring-red-400/50'
            : '',
          touched && valid
            ? '!border-green-400 has-[:focus]:ring-green-400/50'
            : '',
        ])}
      >
        {icon && (
          <span className='text-gray-500 dark:text-gray-500'>{icon}</span>
        )}

        <div
          ref={datePickerWrapper}
          className='relative w-full'
        >
          {/* Trigger Button */}
          <Button
            type='button'
            alt='Open date picker'
            icon={<Calendar className='h-4 w-4' />}
            loading={false}
            disabled={false}
            variant={'muted-transparent'}
            onClick={handleOnWrapperClick}
            label={format(date, 'yyyy-MM-dd HH:mm')}
            className='!w-full max-w-full justify-start outline-none !ring-0 focus:scale-100 active:scale-100'
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
          />

          <AnimatePresence>
            {open && (
              <m.div
                initial={{ opacity: 0, scale: 0.9, y: -40 }}
                animate={{ opacity: 1, scale: 1, y: 0, zIndex: 50 }}
                exit={{ opacity: 0, scale: 0.9, y: -40 }}
                className='fixed mt-1 h-auto w-full rounded border border-gray-200 bg-gray-50 shadow-lg dark:border-slate-800 dark:bg-slate-950 md:w-auto md:min-w-96'
                ref={popoverRef}
                onAnimationEnd={updatePopoverPosition}
              >
                {/* Calendar Section */}
                <div className='flex h-full flex-col gap-4 p-4 md:h-80 md:flex-row'>
                  <div className='flex flex-col gap-1'>
                    {/* Month Navigation */}
                    <div className='flex items-center justify-between'>
                      <button
                        onClick={() => setCalendar(addMonths(calendar, -1))}
                        type='button'
                        className='rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                      >
                        <svg
                          className='h-5 w-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M15 19l-7-7 7-7'
                          />
                        </svg>
                      </button>

                      <span className='font-medium text-gray-600 dark:text-slate-300'>
                        {format(calendar, 'MMMM yyyy')}
                      </span>

                      <button
                        type='button'
                        onClick={() => setCalendar(addMonths(calendar, 1))}
                        className='rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                      >
                        <svg
                          className='h-5 w-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className='grid grid-cols-7 justify-items-center gap-1'>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div
                          key={day}
                          className='flex size-8 items-center justify-center text-center text-xs text-gray-500 dark:text-slate-300'
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className='grid grid-cols-7 justify-items-center gap-1'>
                      {rows.flat().map((d, i) => {
                        const isPast =
                          new Date(d).getTime() <
                          new Date().setHours(0, 0, 0, 0);
                        return (
                          <button
                            type='button'
                            key={i}
                            onClick={() => handleDateClick(d)}
                            disabled={isPast}
                            className={cn([
                              'size-8 rounded text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300',
                              isPast &&
                                'cursor-not-allowed text-gray-300 dark:text-slate-800',
                              !isPast &&
                                !isSameMonth(d, monthStart) &&
                                'text-gray-300 dark:text-slate-800',
                              isSameDay(d, date) &&
                                isSameMonth(d, date) &&
                                'bg-green-500 text-gray-50 hover:bg-green-600 dark:text-slate-300 dark:hover:bg-green-600',
                            ])}
                          >
                            {format(d, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Picker */}
                  <div className='flex flex-col gap-2 md:flex-row'>
                    <div className='flex flex-col md:items-center'>
                      <span className='pb-1 text-xs dark:text-slate-300'>
                        Hour
                      </span>

                      <div
                        ref={hourColumnRef}
                        className='h-auto w-full overflow-x-scroll rounded border border-gray-200 dark:border-slate-800 md:overflow-y-scroll'
                      >
                        <DraggableScroll
                          direction='both'
                          className='flex h-auto w-full items-center md:h-full md:w-auto md:flex-col'
                        >
                          {Array.from<number>({ length: 24 })
                            .map((i, index) => index)
                            .map((i, index) => (
                              <div
                                key={'hour-wrapper-' + index}
                                className='flex !size-10 h-auto items-center justify-center py-1'
                              >
                                <button
                                  type='button'
                                  key={'hour-' + i}
                                  aria-labelledby={
                                    i === date.getHours()
                                      ? 'active-item'
                                      : 'item'
                                  }
                                  onClick={() => handleDateClick(date, i)}
                                  className={`!size-8 w-full rounded-md text-sm transition-colors md:mx-1 ${
                                    i === date.getHours()
                                      ? 'bg-green-500 text-gray-50 hover:bg-green-600 dark:hover:bg-green-600'
                                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300'
                                  }`}
                                >
                                  {i.toString().padStart(2, '0')}
                                </button>
                              </div>
                            ))}
                        </DraggableScroll>
                      </div>
                    </div>

                    <div className='flex flex-col md:items-center'>
                      <span className='pb-1 text-xs dark:text-slate-300'>
                        Minute
                      </span>

                      <div
                        ref={minuteColumnRef}
                        className='h-auto w-full overflow-x-scroll rounded border border-gray-200 dark:border-slate-800 md:overflow-y-scroll'
                      >
                        <DraggableScroll
                          direction='both'
                          className='flex h-auto w-full snap-x snap-mandatory items-center md:h-full md:w-auto md:snap-y md:flex-col'
                        >
                          {Array.from<number>({ length: 60 / step })
                            .map((i, index) => index * step)
                            .map((i, index) => (
                              <div
                                key={'minute-wrapper-' + index}
                                className='flex !size-10 h-auto items-center justify-center py-1'
                              >
                                <button
                                  type='button'
                                  key={'minute-' + i}
                                  aria-labelledby={
                                    i === date.getMinutes()
                                      ? 'active-item'
                                      : 'item'
                                  }
                                  onClick={() =>
                                    handleDateClick(date, undefined, i)
                                  }
                                  className={`!size-8 w-full rounded-md text-sm transition-colors md:mx-1 ${
                                    i === date.getMinutes()
                                      ? 'bg-green-500 text-gray-50 hover:bg-green-600 dark:hover:bg-green-600'
                                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300'
                                  }`}
                                >
                                  {i.toString().padStart(2, '0')}
                                </button>
                              </div>
                            ))}
                        </DraggableScroll>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className='flex justify-between border-t border-gray-200 p-2 dark:border-slate-800'>
                  <Button
                    type='button'
                    alt='Pick Now'
                    label='Now'
                    size={'sm'}
                    variant={'secondary-text'}
                    onClick={() => {
                      handleDateClick(
                        new Date(),
                        new Date().getHours(),
                        new Date().getMinutes(),
                      );
                      setCalendar(new Date());
                    }}
                    className='w-auto'
                  />

                  <Button
                    type='button'
                    alt='Accept'
                    label='Accept'
                    size={'sm'}
                    variant={'primary-text'}
                    className='w-auto'
                    onClick={handleAcceptClick}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </span>

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
