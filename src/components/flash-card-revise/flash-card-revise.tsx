'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '#/components/_ui/button/button';
import useKeyPress from '#/hooks/use-key-press.hook';
import useSpacedRepetition from '#/hooks/use-spaced-repetition';
import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import type { FlashCard } from '#/types/flash-card.type';
import { ArrowRight, CornerLeftDown, RefreshCw } from 'lucide-react';
import Card from '../_ui/card/card';
import Dropdown from '../_ui/dropdown/dropdown';
import LinkComponent from '../_ui/link/link';
import FlashCardComponent from '../flash-card/flash-card';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ShortcutList } from '../shortcut-list/shortcut-list';

export default function FlashCardReviseComponent() {
  const {
    setsDictionary,
    flashcards,
    updateFlashCard,
    metadata,
    updateMetadata,
  } = useAppContext();

  const defaultSet = { value: 'default', label: 'All flash cards' };
  const spaceRepetitionOptions = [
    {
      value: 'again',
      label: 'Again',
      description: 'Show again in ~ 10 minutes',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Show again in ~ 1 hour',
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Show again in ~ 1 day',
    },
    {
      value: 'easy',
      label: 'Easy',
      description: 'Show again in ~ 1 week',
    },
  ] as const;

  const [revisedCard, setRevisedCard] = useState<FlashCard>();
  const [revisedSet, setRevisedSet] = useState<string>(defaultSet.value);
  const [clickedCard, setClickedCard] = useState<FlashCard>();
  const [clickedOption, setClickedOption] = useState<string>();
  const [clicked, setClicked] = useState(false);

  const setFlashCards = useMemo(
    () =>
      flashcards.filter((flashcard) => flashcard?.sets?.includes(revisedSet)),
    [flashcards, revisedSet],
  );

  const {
    reroll,
    calculateRepetition,
    randomItems,
    continueReroll,
    setContinueReroll,
    todayItemsEnd,
  } = useSpacedRepetition({
    array: flashcards as FlashCard[],
    setArray: revisedSet === defaultSet.value ? undefined : setFlashCards,
    differentiateBy: 'type',
  });

  const spaceRepetitionClick = (value: 'again' | 'hard' | 'good' | 'easy') => {
    if (!revisedCard) return;
    window.umami.track('Space repetition clicked', { value });

    setClickedOption(value);
    setClicked(true);

    const spacedItem = calculateRepetition(revisedCard, value);

    updateFlashCard(spacedItem);
  };

  const isCorrect = (flashCard?: FlashCard) => {
    const comparisonItem = flashCard ?? clickedCard;

    return revisedCard === comparisonItem;
  };

  const changeClicked = (flashCard: FlashCard, key?: string) => {
    if (key) {
      window.umami.track('Answer clicked', { key });
    } else {
      window.umami.track('Answer clicked', { key: null });
    }

    if (clicked) {
      return;
    }

    const correct = isCorrect(flashCard);
    const clonedStats = { ...metadata };

    clonedStats.answers += 1;

    // if (correct) {
    //   clonedStats.correctAnswers += 1;
    //   if (revisedCard && revisedCard?.weight > 0.01) {
    //     updateFlashCard({
    //       ...flashCard,
    //       weight: +(flashCard.weight - 0.01).toFixed(2),
    //     });
    //   }
    // } else {
    //   clonedStats.incorrectAnswers += 1;

    //   updateFlashCard({
    //     ...flashCard,
    //     weight: +(flashCard.weight + 0.01).toFixed(2),
    //   });
    // }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    updateMetadata({ ...clonedStats });
    setClickedCard(flashCard);
    setClicked(true);
  };

  const reshuffleFlashCards = () => {
    window.umami.track('Reshuffle flash cards', { key: null, clicked });

    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClickedOption(undefined);
    setClicked(false);

    reroll();
  };

  const reshuffleFlashCardsWithKey = (key: string) => {
    window.umami.track('Reshuffle flash cards', { key, clicked });
    if (!clicked) return;

    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClickedOption(undefined);

    reroll();
  };

  const changeRevisedSet = (value: string) => {
    window.umami.track('Change revised set', { value });
    setClicked(false);
    setRevisedSet(value);
  };

  const continueRerollClick = () => {
    window.umami.track('Continue reshuffling');
    setContinueReroll(true);
  };

  useEffect(() => {
    if (!randomItems?.length) return;

    setRevisedCard(randomItems?.[0]);
  }, [randomItems]);

  useKeyPress(['r'], () => reshuffleFlashCardsWithKey('r'));
  useKeyPress(['ArrowRight'], () => reshuffleFlashCardsWithKey('ArrowRight'));
  // useKeyPress(['1'], () => changeClicked(randomCards[0], '1'));
  // useKeyPress(['2'], () => changeClicked(randomCards[1], '2'));
  // useKeyPress(['3'], () => changeClicked(randomCards[2], '3'));
  // useKeyPress(['4'], () => changeClicked(randomCards[3], '4'));

  return flashcards.length > 0 ? (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-44'>
        {(todayItemsEnd && continueReroll) || !todayItemsEnd ? (
          <>
            <div className='grid w-full items-center justify-center'>
              <div
                className={cn([
                  'flex w-full items-center justify-end gap-2 opacity-0 transition md:translate-x-20',
                  clicked && revisedCard?.type !== 'index' && 'opacity-100',
                ])}
              >
                <CornerLeftDown className='size-5 text-green-400' />

                <span className='w-32 text-xs italic text-gray-600 dark:text-slate-500'>
                  Click on the card to flip it
                </span>
              </div>

              <div>
                {revisedCard ? (
                  <FlashCardComponent
                    key={revisedCard.frontUuid}
                    flashCard={revisedCard}
                    flipBlocked={!clicked}
                  />
                ) : (
                  <Card className='h-96 w-80' />
                )}
              </div>
            </div>

            <ShortcutList
              className='hidden md:flex'
              shortcuts={[
                {
                  name: 'Reshuffle',
                  keys: [
                    'R',
                    <ArrowRight
                      key='ArrowBigRight'
                      className='size-4'
                    />,
                  ],
                },
                {
                  name: 'Answer 1 - 4',
                  keys: ['1', '2', '3', '4'],
                },
              ]}
            />

            <div className='mt-8 grid gap-2 xl:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
              {(revisedCard?.type === 'index' ||
                revisedCard?.type === 'question') && (
                <>
                  {spaceRepetitionOptions.map((option, index) => (
                    <div
                      className={cn([
                        'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:border-slate-800/40 dark:hover:bg-slate-800',
                        clickedOption === option.value &&
                          'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                      ])}
                      key={`answer-${index}`}
                      onClick={() => spaceRepetitionClick(option.value)}
                    >
                      <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                        {index + 1}
                      </span>

                      <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                        {option.label} - {option.description}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {revisedCard?.type === 'single' && randomItems !== null && (
                <>
                  {randomItems.map((flashCard, index) => (
                    <div
                      className={cn([
                        'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800',
                        clickedCard?.frontUuid === revisedCard.frontUuid &&
                          isCorrect(revisedCard) &&
                          'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                        clickedCard?.frontUuid === revisedCard.frontUuid &&
                          !isCorrect(revisedCard) &&
                          'border-red-400/50 bg-red-400/20 hover:!bg-red-100 dark:!border-red-400/40 dark:bg-red-400/20 dark:hover:!bg-red-400/20',
                      ])}
                      key={`answer-${index}`}
                      onClick={() => changeClicked(flashCard)}
                    >
                      <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                        {index + 1}
                      </span>

                      <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                        {flashCard.answer}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
            <p className='flex flex-col gap-1 text-center text-gray-600 dark:text-slate-400'>
              <span>All today&apos;s cards have been reviewed</span>
              <span>Do you want to continue?</span>
              <span className='pt-2 text-sm text-gray-500 dark:text-slate-500'>
                Review timeline will be only affected for <b>again and hard</b>{' '}
                options
              </span>
            </p>

            <Button
              label='Continue'
              size={'sm'}
              onClick={continueRerollClick}
            />
          </div>
        )}
      </div>

      <FloatingButtons>
        <div className='flex w-full flex-col items-center justify-center gap-4'>
          <Button
            label={'Reshuffle'}
            icon={<RefreshCw className='h-4 w-4' />}
            iconPosition={'right'}
            onClick={reshuffleFlashCards}
            size={'xlg'}
            className='!w-full !max-w-xs'
            disabled={!clicked}
          />

          <Dropdown
            config={[defaultSet, ...setsDictionary]}
            onChange={changeRevisedSet}
            value={defaultSet.value}
            contextPosition={'top'}
            labelClassName='max-w-xs bg-gray-50 dark:bg-slate-950'
          />
        </div>
      </FloatingButtons>
    </div>
  ) : (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-xl'>
      <h3 className='text-gray-500 dark:text-slate-200'>
        You dont have any flashcards yet.
      </h3>

      <LinkComponent
        href='/flashcards/learn'
        label='You can add them here'
        className='text-green-400 underline'
      />
    </div>
  );
}
