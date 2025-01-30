'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '#/components/_ui/button/button';
import { db } from '#/db/dexie.db';
import { useFocusTracker } from '#/hooks/use-focus-tracker.hook';
import useKeyPress from '#/hooks/use-key-press.hook';
import useSpacedRepetition from '#/hooks/use-spaced-repetition';
import { useAppContext } from '#/providers/app-context';
import uuid from '#/shared/utils/uuid.util';
import type { Flashcard } from '#/types/flash-card.type';
import type { FocusSession } from '#/types/focus-session.type';
import type { ReviewLog } from '#/types/review-log.type';
import type { ReviseOptionsType } from '#/types/revise-options.type';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Accordion } from '../_ui/accordion/accordion';
import Dropdown from '../_ui/dropdown/dropdown';
import LinkComponent from '../_ui/link/link';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ShortcutList } from '../shortcut-list/shortcut-list';
import { AllRevised } from './all-revised';
import { ReviseItem } from './revise-item';
import { ReviseOptions } from './revise-options';
import { ReviseSession } from './revise-session';

export default function FlashcardReviseComponent() {
  const { setsDictionary, flashcards, metadata, updateMetadata } =
    useAppContext();

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

  const dailyStat = useLiveQuery(() =>
    db.dailyStats
      .where('date')
      .equals(new Date().toISOString().split('T')[0])
      .toArray(),
  )?.[0];

  const defaultSet = { value: 'default', label: 'All flashcards' };
  const [revisedCard, setRevisedCard] = useState<Flashcard>();
  const [revisedSet, setRevisedSet] = useState<string>(defaultSet.value);
  const [clickedCard, setClickedCard] = useState<Flashcard>();
  const [clickedOption, setClickedOption] = useState<string>();
  const [clicked, setClicked] = useState(false);
  const cardsReviewed = useRef(0);
  const cardsRecalled = useRef(0);
  const focusSession = useRef<FocusSession>({
    uuid: uuid(),
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    activeTime: 0,
    distractions: 0,
    synced: false,
  });

  const { activeTime, activeTimeRef, distractionsRef } = useFocusTracker();
  // eslint-disable-next-line no-undef
  const cardTime = useRef<Date>(new Date()); //in seconds

  const setFlashcards = useMemo(
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
    todayItems,
    availableTodayItems,
  } = useSpacedRepetition({
    array: revisedSet === defaultSet.value ? flashcards : setFlashcards,
  });

  const spaceRepetitionClick = (value: ReviseOptionsType) => {
    if (!revisedCard) {
      return;
    }
    window.umami.track('Space repetition clicked', { value });

    if (clicked) {
      return;
    }

    const reviewLog: ReviewLog = {
      timestamp: new Date().toISOString(),
      sessionUuid: focusSession.current.uuid,
      cardFrontUuid: revisedCard.frontUuid,
      recalled: false,
      timeSpent: Math.floor((Date.now() - cardTime.current.getTime()) / 1000),
      tags: revisedCard.tags,
      synced: false,
    };

    if (value === 'easy' || value === 'good') {
      cardsRecalled.current += 1;
      reviewLog.recalled = true;
    }

    db.reviewLogs.add(reviewLog);
    cardsReviewed.current += 1;
    setClickedOption(value);
    setClicked(true);
  };

  const changeClicked = (flashCard: Flashcard | undefined, key?: string) => {
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

    cardsReviewed.current += 1;
    clonedStats.answers += 1;

    if (revisedCard.type === 'single' && correct) {
      clonedStats.correctAnswers += 1;
      cardsRecalled.current += 1;
      setClickedOption('easy');
    } else {
      setClickedOption('again');
      clonedStats.incorrectAnswers += 1;
    }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    updateMetadata({ ...clonedStats });
    setClickedCard(flashCard);
    setClicked(true);
  };

  const reshuffleFlashcards = () => {
    window.umami.track('Reshuffle flashcards', { key: null, clicked });
    if (!clicked || !revisedCard) return;

    calculateRepetition(revisedCard, clickedOption as ReviseOptionsType);
    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClickedOption(undefined);
    setClicked(false);

    reroll();
  };

  const reshuffleFlashcardsWithKey = (key: string) => {
    window.umami.track('Reshuffle flashcards', { key, clicked });
    if (!clicked || !revisedCard) return;

    calculateRepetition(revisedCard, clickedOption as ReviseOptionsType);
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
    cardTime.current = new Date();
  }, [randomItems]);

  useEffect(() => {
    return () => {
      console.log('exit');
      db.focusSessions.put({
        ...focusSession.current,
        end: new Date().toISOString(),
        activeTime: activeTimeRef.current,
        distractions: distractionsRef.current,
      });

      if (dailyStat) {
        db.dailyStats.put({
          date: new Date().toISOString().split('T')[0],
          retention:
            (dailyStat.cardsReviewed + cardsReviewed.current) /
            (dailyStat.cardsRecalled + cardsRecalled.current),
          cardsReviewed: dailyStat.cardsReviewed + cardsReviewed.current,
          cardsRecalled: dailyStat.cardsRecalled + cardsRecalled.current,
          timeSpent: dailyStat.timeSpent + activeTimeRef.current,
          synced: false,
        });
      } else {
        db.dailyStats.put({
          date: new Date().toISOString().split('T')[0],
          retention: cardsReviewed.current / cardsRecalled.current,
          cardsReviewed: cardsReviewed.current,
          cardsRecalled: cardsRecalled.current,
          timeSpent: activeTimeRef.current,
          synced: false,
        });
      }
    };
  }, []);

  useKeyPress([' '], () => reshuffleFlashcardsWithKey('Space'));
  useKeyPress(['ArrowRight'], () => reshuffleFlashcardsWithKey('ArrowRight'));
  useKeyPress(['1'], () => clickRevisedOption('1'));
  useKeyPress(['2'], () => clickRevisedOption('2'));
  useKeyPress(['3'], () => clickRevisedOption('3'));
  useKeyPress(['4'], () => clickRevisedOption('4'));

  return flashcards.length > 0 ? (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-44'>
        {(availableTodayItems === 0 && continueReroll) ||
        availableTodayItems > 0 ? (
          <>
            <div className='flex flex-col gap-4'>
              <ReviseSession
                totalCards={todayItems ?? 0}
                recalled={cardsRecalled.current}
                reviewed={cardsReviewed.current}
                timeSpent={activeTime}
              />

              <Accordion className='hidden md:grid'>
                <Accordion.Item title='Shortcuts'>
                  <ShortcutList
                    className='hidden md:flex md:flex-col md:items-center'
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
                </Accordion.Item>
              </Accordion>
            </div>

            <ReviseItem
              clicked={clicked}
              revisedCard={revisedCard}
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
            onClick={reshuffleFlashcards}
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
