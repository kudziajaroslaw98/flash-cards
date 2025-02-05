import useOutsideAlerter from '#/hooks/use-click-outside.hook';
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
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button } from '../button/button';
import { DraggableScroll } from '../draggable-scroll/draggable-scroll';

export default function DateTimePicker() {
  const hourColumnRef = useRef<HTMLDivElement | null>(null);
  const minuteColumnRef = useRef<HTMLDivElement | null>(null);
  const datePickerWrapper = useRef<HTMLDivElement | null>(null);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Date[][]>([]);
  const [monthStart, setMonthStart] = useState(startOfMonth(date));

  // Calculate the calendar grid for the current month

  useEffect(() => {
    const monthStart = startOfMonth(date);
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
  }, [date]);

  useEffect(() => {
    if (open) {
      // Scroll to selected time
      const scrollToSelected = (
        ref: RefObject<HTMLDivElement | null>,
        value: number,
      ) => {
        if (ref.current) {
          const selected = ref.current.querySelector(`[data-value="${value}"]`);
          if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
          }
        }
      };
      scrollToSelected(hourColumnRef, date.getHours());
      scrollToSelected(minuteColumnRef, date.getMinutes());
    }
  }, [open, date]);

  const handleDateClick = (selectedDay: Date) => {
    const newDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      date.getHours(),
      date.getMinutes(),
    );
    setDate(newDate);
  };

  const updateHour = (hour: number) => setDate(setHours(date, hour));
  const updateMinute = (minute: number) => setDate(setMinutes(date, minute));

  useOutsideAlerter(datePickerWrapper, () => setOpen(false));

  return (
    <div
      ref={datePickerWrapper}
      className='relative w-80 md:w-[400px]'
    >
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className='w-full rounded border px-3 py-2 text-left hover:border-blue-500 focus:border-blue-500 focus:outline-none'
      >
        {format(date, 'yyyy-MM-dd HH:mm')}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className='absolute mt-1 h-auto w-full rounded border border-gray-200 bg-white shadow-lg'
          >
            {/* Calendar Section */}
            <div className='flex h-full flex-col gap-4 p-4 md:flex-row'>
              <div className='md:w-3/4'>
                {/* Month Navigation */}
                <div className='mb-4 flex items-center justify-between'>
                  <button
                    onClick={() => setDate(addMonths(date, -1))}
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
                    {format(date, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setDate(addMonths(date, 1))}
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
                <div className='mb-2 grid grid-cols-7 gap-1'>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div
                      key={day}
                      className='flex h-8 items-center justify-center text-center text-xs text-gray-500'
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1'>
                  {rows.flat().map((d, i) => (
                    <button
                      key={i}
                      onClick={() => handleDateClick(d)}
                      className={`h-8 rounded text-sm ${
                        !isSameMonth(d, monthStart)
                          ? 'text-gray-400'
                          : isSameDay(d, date)
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      {format(d, 'd')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Picker */}
              <div className='flex flex-col gap-2 md:flex-row'>
                <div
                  ref={hourColumnRef}
                  className='rounded border border-gray-200'
                >
                  <DraggableScroll
                    direction='both'
                    className='flex h-auto w-full items-center overflow-y-scroll md:h-full md:w-auto md:flex-col'
                  >
                    {Array.from<number>({ length: 24 })
                      .map((i, index) => index)
                      .map((i, index) => (
                        <div
                          key={'hour-wrapper-' + index}
                          className='flex !size-12 h-auto items-center py-1'
                        >
                          <button
                            key={'hour-' + i}
                            data-value={i}
                            onClick={() => updateHour(i)}
                            className={`!size-10 w-full rounded-md p-2 text-sm ${
                              i === date.getHours()
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

                <div
                  ref={minuteColumnRef}
                  className='h-auto overflow-y-scroll rounded border border-gray-200'
                >
                  <DraggableScroll
                    direction='both'
                    className='flex h-auto w-full snap-x snap-mandatory items-center overflow-y-scroll md:h-full md:w-auto md:snap-y md:flex-col'
                  >
                    {Array.from<number>({ length: 60 })
                      .map((i, index) => index)
                      .map((i, index) => (
                        <div
                          key={'minute-wrapper-' + index}
                          className='flex !size-12 h-auto items-center'
                        >
                          <button
                            key={'minute-' + i}
                            data-value={i}
                            onClick={() => updateMinute(i)}
                            className={`!size-10 w-full rounded-md text-sm ${
                              i === date.getMinutes()
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

            {/* Footer */}
            <div className='flex justify-between border-t border-gray-200 p-2'>
              <Button
                alt='Pick Now'
                label='Now'
                size={'sm'}
                variant={'secondary-text'}
                onClick={() => handleDateClick(new Date())}
                className='w-auto'
              />
              <Button
                alt='Accept'
                label='Continue'
                size={'sm'}
                variant={'primary-text'}
                className='w-auto'
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
