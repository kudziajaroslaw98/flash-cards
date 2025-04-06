'use client';

import { db } from '#/db/dexie.db';
import type { StudyPlan } from '#/types/study-plan.type';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { StudyPlanActions } from './study-plan-actions';
import { StudyPlanList } from './study-plan-list';

export function StudyPlans() {
  const studyPlans = useLiveQuery(() => db.studyPlans.toArray()) ?? [];
  const [filteredPlans, setFilteredPlans] = useState<StudyPlan[]>([]);
  const [selected, setSelected] = useState<StudyPlan[]>([]);

  // TODO: temporary solution before filtering
  useEffect(() => {
    setFilteredPlans(studyPlans);
  }, [studyPlans]);

  return (
    <div>
      <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
          <h4 className='font-fredoka w-52 font-semibold text-green-400'>
            Your Study Plans
          </h4>
          <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
            <span>{studyPlans.length} plans created</span>
          </span>
        </div>
      </div>

      <StudyPlanList
        filteredPlans={filteredPlans}
        selected={selected}
        setSelected={setSelected}
      />

      <StudyPlanActions
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
