import { db } from '#/db/dexie.db';
import { useAppContext } from '#/providers/app-context';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import type { StudyPlan } from '#/types/study-plan.type';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import { type Dispatch, type SetStateAction } from 'react';
import { AlertDialog } from '../_ui/alert-dialog/alert-dialog';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';

export function StudyPlanActions({
  selected,
  setSelected,
}: {
  selected: StudyPlan[];
  setSelected: Dispatch<SetStateAction<StudyPlan[]>>;
}) {
  const { removeStudyPlans } = useAppContext();
  const studyPlans = useLiveQuery(() => db.studyPlans.toArray()) ?? [];

  const removeSelected = () => {
    window.umami.track('Remove flashcards', { count: selected.length });
    removeStudyPlans(selected);
    setSelected([]);
  };

  return (
    <FloatingButtons className='mt-4'>
      <Link href={APP_ROUTES.study.newPlan}>
        <Button
          icon={<Plus className='h-4 w-4' />}
          size={'icon-square'}
          alt='Add new flashcards'
        />
      </Link>

      {studyPlans.length > 0 && (
        <>
          <AlertDialog
            onCancel={() => {
              window.umami.track('Cancel remove flashcards');
            }}
            headerText='Are you absolutely sure?'
            bodyText='This action cannot be undone. This will permanently delete your flashcards.'
            trigger={
              <Button
                disabled={selected.length === 0}
                variant={'destructive'}
                icon={<Trash className='h-4 w-4' />}
                size={'icon-square'}
                alt='Remove flashcards'
              />
            }
            onAccept={removeSelected}
          />
        </>
      )}
    </FloatingButtons>
  );
}
