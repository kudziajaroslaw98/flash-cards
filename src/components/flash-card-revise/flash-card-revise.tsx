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
import { ArrowRight, Coffee, RefreshCw } from 'lucide-react';
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
      description: 'Resetting card',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Review sooner',
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Review on schedule',
    },
    {
      value: 'easy',
      label: 'Easy',
      description: 'Review later',
    },
  ] as const;

  const defaultSet = { value: 'default', label: 'All flashcards' };
  const [answers, setAnswers] = useState<string[]>([]);
  const [answersAvailable, setAnswersAvailable] = useState<boolean>(false);
  const [revisedCard, setRevisedCard] = useState<Flashcard | undefined>();
  const [revisedSet, setRevisedSet] = useState<string>(defaultSet.value);
  const [clickedOption, setClickedOption] = useState<
    ReviseOptionsType | undefined
  >();
  const [clickedAnswer, setClickedAnswer] = useState<string | undefined>();
  const [clicked, setClicked] = useState(false);
  const cardsReviewed = useRef(0);
  const cardsRecalled = useRef(0);
  const focusSession = useRef<FocusSession>({
    frontUuid: uuid(),
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    activeTime: 0,
    distractions: 0,
    synced: false,
    timestamp: new Date().toISOString(),
  });

  const { timerStart, distractionsRef } = useFocusTracker();
  const cardTime = useRef<Date>(new Date());

  const setFlashcards = useMemo(
    () =>
      revisedSet === defaultSet.value
        ? flashcards
        : flashcards.filter((flashcard) =>
            flashcard?.sets?.includes(revisedSet),
          ),
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
    sessionItemsCount,
  } = useSpacedRepetition({
    array: setFlashcards,
    revisedSetId: revisedSet,
    numberOfItems: 1,
  });

  const spaceRepetitionClick = (value: ReviseOptionsType) => {
    if (!revisedCard) {
      return;
    }
    window?.umami?.track('Space repetition clicked', { value });

    if (clicked) {
      return;
    }

    const reviewLog: ReviewLog = {
      frontUuid: uuid(),
      timestamp: new Date().toISOString(),
      sessionUuid: focusSession.current.frontUuid,
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

  const changeClicked = (answer: string, key?: string) => {
    if (!answer || !revisedCard || clicked) return;

    if (key) {
      window?.umami?.track('Answer clicked', { key });
    } else {
      window?.umami?.track('Answer clicked', { key: null });
    }

    const correct = revisedCard?.answer1 === answer;
    const clonedStats = { ...metadata };

    cardsReviewed.current += 1;
    clonedStats.answers += 1;

    const reviewLog: ReviewLog = {
      frontUuid: uuid(),
      timestamp: new Date().toISOString(),
      sessionUuid: focusSession.current.frontUuid,
      cardFrontUuid: revisedCard.frontUuid,
      recalled: false,
      timeSpent: Math.floor((Date.now() - cardTime.current.getTime()) / 1000),
      tags: revisedCard.tags,
      synced: false,
    };

    let reviseOption: ReviseOptionsType;
    if (correct) {
      reviewLog.recalled = true;
    } else {
      reviewLog.recalled = false;
    }

    if (revisedCard.type === 'single' && correct) {
      clonedStats.correctAnswers += 1;
      cardsRecalled.current += 1;
      reviseOption = 'easy';
    } else {
      reviseOption = 'again';
      clonedStats.incorrectAnswers += 1;
    }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    db.reviewLogs.add(reviewLog);
    updateMetadata({ ...clonedStats });
    setClickedAnswer(answer);
    setClickedOption(reviseOption);
    setClicked(true);
  };

  const handleReshuffle = async (key?: string) => {
    const trigger = key || 'button';
    window?.umami?.track('Reshuffle flashcards', { trigger, clicked });

    if (!clicked || !revisedCard || !clickedOption) return;

    const lastCardUuid = revisedCard.frontUuid;

    try {
      // Perform calculation first (this updates the card in the DB)
      await calculateRepetition(revisedCard, clickedOption);

      // Reset UI state for the next card
      setClickedOption(undefined);
      setClickedAnswer(undefined);
      setClicked(false);
      // revisedCard will be updated by the useEffect watching randomItems

      // Reroll, removing the just-reviewed card from the session deck
      reroll(lastCardUuid);
    } catch (error) {
      console.error('Error during reshuffle:', error);
      // Handle error appropriately, maybe show a notification
    }
  };

  const changeRevisedSet = (value: string) => {
    window?.umami?.track('Change revised set', { value });
    // Resetting state when set changes
    setClicked(false);
    setClickedOption(undefined);
    setClickedAnswer(undefined);
    setRevisedCard(undefined);
    setRevisedSet(value);
  };

  const continueRerollClick = () => {
    window?.umami?.track('Continue reshuffling');
    setRevisedCard(undefined); // Clear current card display
    setClickedOption(undefined); // Reset options
    setClickedAnswer(undefined);
    setClicked(false); // Reset clicked state
    setContinueReroll(true);
  };

  const clickRevisedOption = (key: string) => {
    const index = parseInt(key) - 1;
    if (index < 0 || index > 3) return; // Invalid key
    if (revisedCard?.type === 'index' || revisedCard?.type === 'question') {
      if (index < spaceRepetitionOptions.length) {
        spaceRepetitionClick(spaceRepetitionOptions[index].value);
      }
    } else if (revisedCard?.type === 'single' && answersAvailable) {
      changeClicked(answers[index], key);
    }
  };

  useEffect(() => {
    if (randomItems && randomItems.length > 0) {
      // Display the first item from the potentially new batch
      setRevisedCard(randomItems[0]);
      cardTime.current = new Date(); // Reset timer for the new card
    } else {
      // Handle case where randomItems becomes empty (e.g., end of deck)
      setRevisedCard(undefined);
    }
  }, [randomItems]);

  useEffect(() => {
    return () => {
      if (!focusSession.current || timerStart.current === null) return;
      const now = new Date();
      const sessionActiveTime = timerStart.current
        ? (now.setMilliseconds(0) - timerStart.current.setMilliseconds(0)) /
          1000
        : 0;
      db.focusSessions.put({
        ...focusSession.current,
        timestamp: new Date().toISOString(),
        end: new Date().toISOString(),
        activeTime: sessionActiveTime,
        distractions: distractionsRef.current,
      });

      const updateDailyStats = async () => {
        const dailyStat = await db.dailyStats.get(
          new Date().toISOString().split('T')[0],
        );
        if (dailyStat) {
          db.dailyStats.put({
            ...dailyStat,
            date: new Date().toISOString().split('T')[0],
            retention: parseFloat(
              (
                (dailyStat.cardsRecalled + cardsRecalled.current) /
                (dailyStat.cardsReviewed + cardsReviewed.current)
              ).toFixed(2),
            ),
            cardsReviewed: dailyStat.cardsReviewed + cardsReviewed.current,
            cardsRecalled: dailyStat.cardsRecalled + cardsRecalled.current,
            timeSpent: dailyStat.timeSpent + sessionActiveTime,
            synced: false,
          });
        } else {
          db.dailyStats.put({
            updatedAt: new Date().toISOString(),
            frontUuid: uuid(),
            date: new Date().toISOString().split('T')[0],
            retention: cardsReviewed.current / cardsRecalled.current,
            cardsReviewed: cardsReviewed.current,
            cardsRecalled: cardsRecalled.current,
            timeSpent: sessionActiveTime,
            synced: false,
          });
        }
      };

      updateDailyStats();
    };
  }, [distractionsRef, timerStart, updateMetadata]);

  useEffect(() => {
    const answers = [
      revisedCard?.answer1 ?? null,
      revisedCard?.answer2 ?? null,
      revisedCard?.answer3 ?? null,
      revisedCard?.answer4 ?? null,
    ]
      .filter((answer) => answer !== null && answer !== '')
      .sort(() => Math.random() - 0.5) as string[];
    setAnswers(answers);
    setAnswersAvailable(answers.some((answer) => answer !== null));
  }, [revisedCard]);

  useKeyPress([' '], () => handleReshuffle('Space'));
  useKeyPress(['ArrowRight'], () => handleReshuffle('ArrowRight'));
  useKeyPress(['1'], () => clickRevisedOption('1'));
  useKeyPress(['2'], () => clickRevisedOption('2'));
  useKeyPress(['3'], () => clickRevisedOption('3'));
  useKeyPress(['4'], () => clickRevisedOption('4'));

  // Determine if there are cards available to revise
  const canRevise = randomItems && randomItems.length > 0 && revisedCard;
  // Determine if the session is completely finished (no items due, not continuing)
  const sessionFinished =
    availableTodayItems === 0 && !continueReroll && sessionItemsCount === 0;
  // Determine if user finished today's cards but could continue
  const finishedTodayCanContinue =
    availableTodayItems === 0 &&
    !continueReroll &&
    sessionItemsCount === 0 &&
    flashcards.length > 0;

  if (flashcards.length === 0) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
        <div className='flex w-full flex-col items-center justify-center py-10 text-center'>
          <Coffee className='mb-8 size-12 text-green-500' />
          <span>This review session is a no-show</span>
          <span>your flashcards must be off on a coffee break.</span>

          <LinkComponent
            href='/flashcards/learn'
            className='mt-8'
          >
            <Button
              label={'Time to bring them back!'}
              icon={<ArrowRight className='size-4' />}
              iconPosition='right'
              alt='Redirect to learn page'
            />
          </LinkComponent>
        </div>
      </div>
    );
  }

  if (!canRevise && finishedTodayCanContinue) {
    // Finished today's due cards, show option to continue
    return (
      <div className='flex h-full w-full flex-col justify-stretch'>
        <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
          <AllRevised>
            <Button
              label='Continue with All Cards'
              size={'sm'}
              onClick={continueRerollClick}
              alt='Continue reshuffling with all cards'
            />
          </AllRevised>
        </div>
      </div>
    );
  }

  if (
    (!canRevise && finishedTodayCanContinue) ||
    (!canRevise && sessionFinished)
  ) {
    // All cards revised, nothing left to do
    return (
      <div className='flex h-full w-full flex-col justify-stretch'>
        <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
          <AllRevised>
            <Button
              label='Continue with All Cards'
              size={'sm'}
              onClick={continueRerollClick}
              alt='Continue reshuffling with all cards'
            />
          </AllRevised>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
        <div className='flex flex-col gap-4'>
          <ReviseSession
            totalCards={todayItems ?? 0}
            recalled={cardsRecalled.current}
            reviewed={cardsReviewed.current}
            timerStart={timerStart}
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

        <ReviseItem revisedCard={revisedCard} />

        <ReviseOptions
          clicked={clicked}
          clickedOption={clickedOption}
          revisedCard={revisedCard}
          spaceRepetitionClick={spaceRepetitionClick}
          changeClicked={changeClicked}
          clickedAnswer={clickedAnswer}
          answers={answers}
          answersAvailable={answersAvailable}
        />
      </div>

      <FloatingButtons>
        <div className='flex w-full flex-col items-center justify-center gap-2 py-2'>
          <Button
            label={'Next Card'}
            icon={<RefreshCw className='h-4 w-4' />}
            iconPosition={'right'}
            onClick={() => handleReshuffle()}
            size={'xlg'}
            className='!w-full !max-w-xs'
            disabled={!clicked || !revisedCard}
            alt='Proceed to next flashcard'
          />

          <Dropdown
            type='dropdown'
            multiple={false}
            config={[defaultSet, ...setsDictionary]}
            onChange={changeRevisedSet}
            value={revisedSet}
            contextPosition='top'
            labelClassName='max-w-xs bg-gray-50 dark:bg-slate-950'
          />
        </div>
      </FloatingButtons>
    </div>
  );
}
