import { useAppContext } from '#/providers/app-context';
import type { Flashcard } from '#/types/flash-card.type';
import { Pencil, Plus, Trash } from 'lucide-react';
import { AlertDialog } from '../_ui/alert-dialog/alert-dialog';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { NewFlashcardModal } from '../new-flash-card-modal/new-flash-card-modal';

export default function FlashcardsActions({
  selected,
  setSelected,
}: {
  selected: Flashcard[];
  setSelected: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}) {
  const {
    flashcards,
    updateFlashcards,
    addFlashcards,
    metadata,
    updateMetadata,
    removeFlashcards,
  } = useAppContext();

  const addNewRecord = (flashcards: Partial<Flashcard>[]) => {
    window.umami.track('Add flashcards', { count: flashcards.length });
    addFlashcards(flashcards);

    updateMetadata({
      ...metadata,
      createdFlashCards: metadata.createdFlashCards + flashcards.length,
    });

    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };

  const editSelectedRecords = (editRecords: Partial<Flashcard>[]) => {
    window.umami.track('Edit flashcards', { count: editRecords.length });
    updateFlashcards(editRecords);
  };

  const removeSelected = () => {
    window.umami.track('Remove flashcards', { count: selected.length });
    removeFlashcards(selected);
    setSelected([]);
  };

  return (
    <FloatingButtons className='mt-4'>
      <NewFlashcardModal
        handleNewFlashcard={addNewRecord}
        handleEditFlashcard={() => null}
        selectedFlashcards={[]}
        isInEditMode={false}
        trigger={
          <Button
            icon={<Plus className='h-4 w-4' />}
            size={'icon-square'}
            alt='Add new flashcards'
          />
        }
      />

      {flashcards.length > 0 && (
        <>
          <NewFlashcardModal
            handleNewFlashcard={() => null}
            handleEditFlashcard={editSelectedRecords}
            selectedFlashcards={selected}
            isInEditMode={true}
            trigger={
              <Button
                icon={<Pencil className='h-4 w-4' />}
                size={'icon-square'}
                disabled={selected.length === 0}
                variant={'secondary'}
                alt='Edit flashcards'
              />
            }
          />
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
