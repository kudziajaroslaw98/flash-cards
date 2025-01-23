'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '#/components/_ui/button/button';
import useKeyPress from '#/hooks/use-key-press.hook';
import useSpacedRepetition from '#/hooks/use-spaced-repetition';
import { useAppContext } from '#/providers/app-context';
import type { FlashCard } from '#/types/flash-card.type';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Dropdown from '../_ui/dropdown/dropdown';
import LinkComponent from '../_ui/link/link';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ShortcutList } from '../shortcut-list/shortcut-list';
import { AllRevised } from './all-revised';
import { ReviseItem } from './revise-item';
import { ReviseOptions } from './revise-options';

export default function FlashCardReviseComponent() {
  const {
    setsDictionary,
    flashcards,
    updateFlashCard,
    metadata,
    updateMetadata,
  } = useAppContext();

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

  const defaultSet = { value: 'default', label: 'All flashcards' };
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

  const changeClicked = (flashCard: FlashCard | undefined, key?: string) => {
    if (!flashCard || !revisedCard) return;

    if (key) {
      window.umami.track('Answer clicked', { key });
    } else {
      window.umami.track('Answer clicked', { key: null });
    }

    if (clicked) {
      return;
    }

    const correct = revisedCard?.frontUuid === flashCard.frontUuid;
    const clonedStats = { ...metadata };

    clonedStats.answers += 1;
    let spacedItem;

    if (revisedCard.type === 'single' && correct) {
      clonedStats.correctAnswers += 1;
      spacedItem = calculateRepetition(revisedCard, 'good');
    } else {
      clonedStats.incorrectAnswers += 1;
      spacedItem = calculateRepetition(revisedCard, 'again');
    }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    updateMetadata({ ...clonedStats });
    updateFlashCard(spacedItem);
    setClickedCard(flashCard);
    setClicked(true);
  };

  const reshuffleFlashCards = () => {
    window.umami.track('Reshuffle flashcards', { key: null, clicked });

    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClickedOption(undefined);
    setClicked(false);

    reroll();
  };

  const reshuffleFlashCardsWithKey = (key: string) => {
    window.umami.track('Reshuffle flashcards', { key, clicked });
    if (!clicked) return;

    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClickedOption(undefined);
    setClicked(false);

    reroll();
  };

  const changeRevisedSet = (value: string) => {
    window.umami.track('Change revised set', { value });
    setClicked(false);
    setRevisedSet(value);
  };

  const continueRerollClick = () => {
    window.umami.track('Continue reshuffling');
    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClickedOption(undefined);
    setClicked(false);
    setContinueReroll(true);
  };

  const clickRevisedOption = (key: string) => {
    const index = parseInt(key) - 1;
    if (revisedCard?.type === 'index' || revisedCard?.type === 'question') {
      spaceRepetitionClick(spaceRepetitionOptions[index].value);
    } else {
      changeClicked(randomItems?.[index], key);
    }
  };

  useEffect(() => {
    if (!randomItems?.length) return;

    setRevisedCard(randomItems?.[0]);
  }, [randomItems]);

  useKeyPress([' '], () => reshuffleFlashCardsWithKey('Space'));
  useKeyPress(['ArrowRight'], () => reshuffleFlashCardsWithKey('ArrowRight'));
  useKeyPress(['1'], () => clickRevisedOption('1'));
  useKeyPress(['2'], () => clickRevisedOption('2'));
  useKeyPress(['3'], () => clickRevisedOption('3'));
  useKeyPress(['4'], () => clickRevisedOption('4'));

  return flashcards.length > 0 ? (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-44'>
        {(todayItemsEnd && continueReroll) || !todayItemsEnd ? (
          <>
            <ReviseItem
              clicked={clicked}
              revisedCard={revisedCard}
            />

            <ShortcutList
              className='hidden md:flex'
              shortcuts={[
                {
                  name: 'Reshuffle',
                  keys: [
                    'Space',
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

            <ReviseOptions
              clicked={clicked}
              clickedCard={clickedCard}
              clickedOption={clickedOption}
              randomItems={randomItems}
              revisedCard={revisedCard}
              spaceRepetitionClick={spaceRepetitionClick}
              changeClicked={changeClicked}
            />
          </>
        ) : (
          <AllRevised>
            <Button
              label='Continue'
              size={'sm'}
              onClick={continueRerollClick}
              alt='Continue reshuffling'
            />
          </AllRevised>
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
            alt='Reshuffle flashcards'
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
