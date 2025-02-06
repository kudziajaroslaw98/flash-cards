import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
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
  value?: string | Date;
  required?: boolean;
  className?: string;
  onChange?: (date: Date) => void;
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
  error = null,
  touched = false,
  className = '',
  type = 'datetime-picker',
}: DateTimePickerProps) {
  const hourColumnRef = useRef<HTMLDivElement | null>(null);
  const minuteColumnRef = useRef<HTMLDivElement | null>(null);
  const datePickerWrapper = useRef<HTMLDivElement | null>(null);
  const [date, setDate] = useState(new Date());
  const [calendar, setCalendar] = useState(new Date());
  const [dateMinutes, setDateMinutes] = useState(0);
  const [dateHours, setDateHours] = useState(0);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Date[][]>([]);
  const [monthStart, setMonthStart] = useState(startOfMonth(date));

  // Calculate the calendar grid for the current month

  useEffect(() => {
    if (!value) return;
    setCalendar(new Date(value));
    setDate(new Date(value));
  }, [value]);

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
    handleDateClick(date);
  }, []);

  const scrollToSelected = (ref: RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const selected = ref.current.querySelector(
        `[aria-labelledby="active-item"]`,
      );
      if (selected) {
        selected.scrollIntoView({ block: 'center', inline: 'center' });
      }
    }
  };

  useEffect(() => {
    if (open) {
      // Scroll to selected time
      scrollToSelected(hourColumnRef);
      scrollToSelected(minuteColumnRef);
    }
  }, [open, date]);

  const handleDateClick = (
    selectedDay: Date,
    hours?: number,
    minutes?: number,
  ) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDay < today) return;

    const newDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      hours ?? date.getHours(),
      minutes ?? date.getMinutes(),
    );

    setDate(newDate);
    setDateMinutes(newDate.getMinutes());
    setDateHours(newDate.getHours());
    setCalendar(newDate);
  };

  const updateHour = (hour: number) => {
    setDate(setHours(date, hour));
    setDateHours(hour);
  };
  const updateMinute = (minute: number) => {
    setDate(setMinutes(date, minute));
    setDateMinutes(minute);
  };

  const handleOnChange = () => {
    if (onChange) {
      onChange(date);
    }
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
    handleOnChange();
  }, [date]);

  useOutsideAlerter(datePickerWrapper, () => {
    setOpen(false);
    if (onBlur) onBlur();
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
            alt='Open date picker'
            icon={<Calendar className='h-4 w-4' />}
            loading={false}
            disabled={false}
            variant={'muted-transparent'}
            onClick={handleOnWrapperClick}
            label={format(date, 'yyyy-MM-dd HH:mm')}
            className='!w-full max-w-full justify-start outline-none !ring-0 focus:scale-100 active:scale-100'
          />

          <AnimatePresence>
            {open && (
              <m.div
                initial={{ opacity: 0, scale: 0.9, y: -40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -40 }}
                className='absolute mt-1 h-auto w-full rounded border border-gray-200 bg-white shadow-lg'
              >
                {/* Calendar Section */}
                <div className='flex h-full flex-col gap-4 p-4 md:h-72 md:flex-row'>
                  <div className='flex flex-col gap-1'>
                    {/* Month Navigation */}
                    <div className='flex items-center justify-between'>
                      <button
                        onClick={() => setCalendar(addMonths(calendar, -1))}
                        className='rounded p-1 hover:bg-gray-100'
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

                      <span className='font-medium'>
                        {format(calendar, 'MMMM yyyy')}
                      </span>

                      <button
                        onClick={() => setCalendar(addMonths(calendar, 1))}
                        className='rounded p-1 hover:bg-gray-100'
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
                    <div className='grid grid-cols-7 justify-items-center'>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div
                          key={day}
                          className='flex size-8 items-center justify-center text-center text-xs text-gray-500'
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className='grid grid-cols-7 justify-items-center'>
                      {rows.flat().map((d, i) => {
                        const isPast =
                          new Date(d).getTime() <
                          new Date().setHours(0, 0, 0, 0);
                        return (
                          <button
                            key={i}
                            onClick={() => handleDateClick(d)}
                            disabled={isPast}
                            className={cn([
                              'size-8 rounded text-sm hover:bg-gray-100',
                              isPast && 'cursor-not-allowed text-gray-300',
                              !isPast &&
                                !isSameMonth(d, monthStart) &&
                                'text-gray-400',
                              isSameDay(d, date) &&
                                isSameMonth(d, date) &&
                                'bg-blue-500 text-white',
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
                      <span className='text-xs'>Hour</span>

                      <div
                        ref={hourColumnRef}
                        className='h-auto w-full overflow-x-scroll rounded border border-gray-200 md:overflow-y-scroll'
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
                                className='flex !size-10 h-auto items-center py-1'
                              >
                                <button
                                  key={'hour-' + i}
                                  aria-labelledby={
                                    i === dateHours ? 'active-item' : 'item'
                                  }
                                  data-value={i}
                                  onClick={() => updateHour(i)}
                                  className={`!size-8 w-full rounded-md p-2 text-sm md:mx-1 ${
                                    i === dateHours
                                      ? 'bg-blue-500 text-white'
                                      : 'text-gray-700 hover:bg-gray-100'
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
                      <span className='text-xs'>Minute</span>

                      <div
                        ref={minuteColumnRef}
                        className='h-auto w-full overflow-x-scroll rounded border border-gray-200 md:overflow-y-scroll'
                      >
                        <DraggableScroll
                          direction='both'
                          className='flex h-auto w-full snap-x snap-mandatory items-center md:h-full md:w-auto md:snap-y md:flex-col'
                        >
                          {Array.from<number>({ length: 60 })
                            .map((i, index) => index)
                            .map((i, index) => (
                              <div
                                key={'minute-wrapper-' + index}
                                className='flex !size-10 h-auto items-center'
                              >
                                <button
                                  key={'minute-' + i}
                                  data-value={i}
                                  aria-labelledby={
                                    i === dateMinutes ? 'active-item' : 'item'
                                  }
                                  onClick={() => updateMinute(i)}
                                  className={`!size-8 w-full rounded-md text-sm md:mx-1 ${
                                    i === dateMinutes
                                      ? 'bg-blue-500 text-white'
                                      : 'text-gray-700 hover:bg-gray-100'
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
                <div className='flex justify-between border-t border-gray-200 p-2'>
                  <Button
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
