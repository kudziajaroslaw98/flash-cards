'use client';
import { db } from '#/db/dexie.db';
import { calculateFocusRatio } from '#/shared/utils/charts/calculate-focus-ratio';
import { getPeakFocusTimes } from '#/shared/utils/charts/get-peak-focus-times';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Activity,
  ChartNoAxesCombined,
  ChartPie,
  ChartSpline,
  ClockAlert,
  Zap,
} from 'lucide-react';
import Card from '../_ui/card/card';
import { DistractionPatterns } from '../charts/distraction-patterns';
import { WeeklyFocusChart } from '../charts/weekly-focus';
import RetentionHeatmap from '../retention-heatmap/retention-heatmap';

export function Dashboard() {
  const sessions = useLiveQuery(() => db.focusSessions.toArray()) ?? [];
  const metadata = useLiveQuery(() => db.metadata.toCollection().first());
  const focusRatio = calculateFocusRatio(sessions);
  const peakTimes = getPeakFocusTimes(sessions);

  const formatHour = (hour: number) => {
    const options = { hour: 'numeric', hour12: true } as const;
    return new Date(2023, 0, 1, hour).toLocaleTimeString('en-US', options);
  };

  const formatDurationFull = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
      <div className='grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card
          motion={false}
          className='col-span-1'
        >
          <div>
            <div className='flex items-center gap-4'>
              <div className='mt-1 flex size-6 items-center justify-center rounded-md bg-green-400'>
                <ChartPie className={`size-4  stroke-gray-50`} />
              </div>

              <p>
                <span className='font-semibold leading-5'>Focus Ratio</span>
              </p>
            </div>
          </div>
          {sessions.length === 0 ? (
            <span className='text-sm'>No data available yet</span>
          ) : (
            <div className='flex flex-wrap gap-4'>
              <div className='text-4xl font-bold text-green-400'>
                {Math.round(focusRatio.ratio * 100)}%
              </div>
              <span className='flex flex-col text-sm text-gray-600'>
                <span className='flex gap-2'>
                  <span className='font-semibold'>Active:</span>
                  <span>{`${formatDurationFull(focusRatio.totalActive)}`}</span>
                </span>
                <span className='flex gap-2'>
                  <span className='font-semibold'>Total:</span>
                  <span>{`${formatDurationFull(focusRatio.totalTime)}`}</span>
                </span>
              </span>
            </div>
          )}
        </Card>

        <Card
          motion={false}
          className='col-span-1'
        >
          <div className='flex items-center gap-4'>
            <div className='mt-1 flex size-6 items-center justify-center rounded-md bg-green-400'>
              <ChartNoAxesCombined className={`size-4  stroke-gray-50`} />
            </div>

            <span className='font-semibold leading-5'>Peak Focus Times</span>
          </div>
          {peakTimes.length === 0 && (
            <span className='text-sm'>No data available yet</span>
          )}
          <ul className='list-disc pl-4 text-sm'>
            {peakTimes.map((time) => (
              <li key={time.hour}>
                <span className='font-semibold'>{formatHour(time.hour)} </span>
                <span>({Math.round(time.ratio * 100)}%)</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          motion={false}
          className='col-span-1'
        >
          <div className='flex items-center gap-4 '>
            <div className='flex size-6 items-center justify-center rounded-md bg-green-400'>
              <Zap className={`size-4 fill-gray-50 stroke-none`} />
            </div>

            <span className='font-semibold leading-4'>Flashcards created</span>
          </div>

          <div className='text-4xl font-bold text-green-400'>
            {metadata?.createdFlashCards ?? 0}
          </div>
        </Card>

        <Card
          motion={false}
          className='col-span-1 flex w-full md:col-span-2 lg:col-span-3 lg:items-center lg:justify-center'
        >
          <div className='flex items-center gap-4'>
            <div className='mt-1 flex size-6 items-center justify-center rounded-md bg-green-400'>
              <Activity className={`size-4  stroke-gray-50`} />
            </div>

            <span className='font-semibold leading-5'>
              Your daily performance
            </span>
          </div>
          <RetentionHeatmap />
        </Card>
        <Card
          motion={false}
          className='col-span-1 flex w-full md:col-span-2 lg:col-span-3 lg:items-center lg:justify-center'
        >
          <div className='flex items-center gap-4'>
            <div className='mt-1 flex size-6 items-center justify-center rounded-md bg-green-400'>
              <ChartSpline className={`size-4  stroke-gray-50`} />
            </div>

            <span className='font-semibold leading-5'>Weekly Focus Trends</span>
          </div>
          <WeeklyFocusChart sessions={sessions} />
        </Card>

        <Card
          motion={false}
          className='col-span-1 flex w-full md:col-span-2 lg:col-span-3 lg:items-center lg:justify-center'
        >
          <div className='flex items-center gap-4'>
            <div className='mt-1 flex size-6 items-center justify-center rounded-md bg-green-400'>
              <ClockAlert className={`size-4  stroke-gray-50`} />
            </div>

            <span className='font-semibold leading-5'>
              Distraction Patterns
            </span>
          </div>
          <DistractionPatterns sessions={sessions} />
        </Card>
      </div>
    </div>
  );
}
