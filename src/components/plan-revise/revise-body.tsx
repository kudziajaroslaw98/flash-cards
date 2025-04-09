import { db } from '#/db/dexie.db';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import type { Flashcard } from '#/types/flash-card.type';
import type { ReviseOptionsType } from '#/types/revise-options.type';
import { useState } from 'react';
import ProgressBar from '../_ui/progress-bar/progress-bar';
import { ReviseItem } from '../flash-card-revise/revise-item';
import { ReviseOptions } from '../flash-card-revise/revise-options';

export function ReviseBody({
  clicked,
  setClicked,
  revisedCard,
}: {
  clicked: boolean;
  setClicked: (value: boolean) => void;
  revisedCard: Flashcard | undefined;
}) {
  const [clickedOption, setClickedOption] = useState<string>();
  const { currentDay, currentSession } = useRevisePlanContext();

  const reviewedCards = currentSession?.completedCards.length ?? 0;
  const recalled = currentDay?.correctCards.length ?? 0;
  const totalCards =
    (currentDay?.cardsToReview.length ?? 0) +
    (currentDay?.newCards.length ?? 0);

  const spaceRepetitionClick = (value: ReviseOptionsType) => {
    if (!revisedCard) {
      return;
    }
    window?.umami?.track('Space repetition clicked', { value });

    if (clicked) {
      return;
    }

    // const reviewLog: ReviewLog = {
    //   frontUuid: uuid(),
    //   timestamp: new Date().toISOString(),
    //   sessionUuid: focusSession.current.frontUuid,
    //   cardFrontUuid: revisedCard.frontUuid,
    //   recalled: false,
    //   timeSpent: Math.floor((Date.now() - cardTime.current.getTime()) / 1000),
    //   tags: revisedCard.tags,
    //   synced: false,
    // };

    // if (value === 'easy' || value === 'good') {
    //   // cardsRecalled.current += 1;
    //   reviewLog.recalled = true;
    // }

    // db.reviewLogs.add(reviewLog);
    // cardsReviewed.current += 1;
    setClickedOption(value);
    setClicked(true);
  };

  const changeClicked = async (answer: string | undefined, key?: string) => {
    if (!answer || !revisedCard || !currentDay || !currentSession) return;

    if (key) {
      window?.umami?.track('Answer clicked', { key });
    } else {
      window?.umami?.track('Answer clicked', { key: null });
    }

    if (clicked) {
      return;
    }

    const correct = revisedCard.answer1 === answer;
    // const clonedStats = { ...metadata };

    // cardsReviewed.current += 1;
    // clonedStats.answers += 1;

    if (revisedCard.type === 'single' && correct) {
      // clonedStats.correctAnswers += 1;
      // cardsRecalled.current += 1;
      setClickedOption('easy');
      await db.studyDays.update(currentDay.frontUuid, {
        correctCards: [...currentDay.correctCards, revisedCard.frontUuid],
      });
    } else {
      setClickedOption('again');
      await db.studyDays.update(currentDay.frontUuid, {
        incorrectCards: [...currentDay.incorrectCards, revisedCard.frontUuid],
      });
      // clonedStats.incorrectAnswers += 1;
    }

    await db.studySessions.update(currentSession.frontUuid, {
      completedCards: [...currentSession.completedCards, revisedCard.frontUuid],
    });

    // clonedStats.accuracy = parseFloat(
    // (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    // );

    // updateMetadata({ ...clonedStats });
    setClicked(true);
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='grid h-full w-full flex-col items-center justify-center gap-3'>
          <div className='flex items-center justify-start'>
            <h6 className='text-sm text-gray-600 dark:text-slate-200'>
              Plan Session summary
            </h6>
          </div>

          <div className='flex flex-wrap justify-between gap-3 text-xs text-gray-600 dark:text-slate-400'>
            <span>
              <span>Total cards:</span>{' '}
              <span className='font-semibold'>{totalCards}</span>
            </span>

            <span>
              <span>Reviewed cards:</span>{' '}
              <span className='font-semibold'>{reviewedCards}</span>
            </span>

            <span>
              <span>Recalled:</span>{' '}
              <span className='font-semibold'>{recalled}</span>
            </span>

            {/* <span className='flex gap-1'>
                  <span>Time spent:</span>
                  <span className='flex w-14 font-semibold'>
                    {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                  </span>
                </span> */}
          </div>

          <ProgressBar
            value={reviewedCards}
            max={totalCards}
          />
        </div>
      </div>

      <ReviseItem
        clicked={clicked}
        revisedCard={revisedCard}
      />

      <ReviseOptions
        clicked={clicked}
        clickedOption={clickedOption}
        revisedCard={revisedCard}
        spaceRepetitionClick={spaceRepetitionClick}
        changeClicked={changeClicked}
      />
    </>
  );
}
