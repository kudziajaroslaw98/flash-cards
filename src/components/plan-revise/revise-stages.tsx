import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import { useMemo } from 'react';
import { Case } from '../_ui/switch-case/case';
import { SwitchCase } from '../_ui/switch-case/switch-case';
import { ReviseAllStage } from './revise-all-stage';
import { ReviseIncorrectSummary } from './revise-incorrect-summary';
import { ReviseNewStage } from './revise-new-stage';
import { ReviseOldStage } from './revise-old-stage';

export function ReviseStages() {
  const {
    reviseStage: stage,
    setReviseStage: setStage,
    currentDay,
    reviewFlashcards,
    newFlashcards,
  } = useRevisePlanContext();

  // Memoize the calculation of correct/incorrect counts for summaries
  const { reviewCorrect, reviewIncorrect, newCorrect, newIncorrect } =
    useMemo(() => {
      if (!currentDay) {
        return {
          reviewCorrect: [],
          reviewIncorrect: [],
          newCorrect: [],
          newIncorrect: [],
        };
      }

      const reviewCorrectSet = new Set<string>();
      const reviewIncorrectSet = new Set<string>();
      const newCorrectSet = new Set<string>();
      const newIncorrectSet = new Set<string>();

      const reviewCardUuids = new Set(
        currentDay.cardsToReview.map((uuid) => uuid),
      );

      currentDay.correctCards.forEach((cardUuid) => {
        if (reviewCardUuids.has(cardUuid)) {
          reviewCorrectSet.add(cardUuid);
        } else {
          newCorrectSet.add(cardUuid);
        }
      });

      currentDay.incorrectCards.forEach((cardUuid) => {
        if (reviewCardUuids.has(cardUuid)) {
          reviewIncorrectSet.add(cardUuid);
        } else {
          newIncorrectSet.add(cardUuid);
        }
      });

      return {
        reviewCorrect: Array.from(reviewCorrectSet),
        reviewIncorrect: Array.from(reviewIncorrectSet),
        newCorrect: Array.from(newCorrectSet),
        newIncorrect: Array.from(newIncorrectSet),
      };
    }, [currentDay]); // Recalculate only when currentDay changes

  const reviewRetention =
    reviewFlashcards.length > 0
      ? reviewCorrect.length / reviewFlashcards.length
      : 0;
  const newRetention =
    newFlashcards.length > 0 ? newCorrect.length / newFlashcards.length : 0;

  // Determine if summary stages should be shown
  const showReviewSummary = reviewFlashcards.length > 0;
  const showNewSummary = newFlashcards.length > 0;
  const showAllIncorrect = reviewIncorrect.length + newIncorrect.length > 0;

  // Determine the next stage dynamically
  const getNextStage = (currentStage: number): number => {
    switch (currentStage) {
      case 1: // After Old Stage
        return showReviewSummary
          ? 2
          : showNewSummary
            ? 3
            : showAllIncorrect
              ? 5
              : 6;
      case 2: // After Review Summary
        return showNewSummary ? 3 : showAllIncorrect ? 5 : 6;
      case 3: // After New Stage
        return showNewSummary ? 4 : showAllIncorrect ? 5 : 6;
      case 4: // After New Summary
        return showAllIncorrect ? 5 : 6;
      case 5: // After All Incorrect
        return 6; // End
      default:
        return 6; // Default to end
    }
  };

  return (
    <SwitchCase condition={stage}>
      <Case caseValue={1}>
        <ReviseOldStage />
      </Case>

      {showReviewSummary && (
        <Case caseValue={2}>
          <ReviseIncorrectSummary
            cardsCount={reviewFlashcards.length}
            correctCount={reviewCorrect.length}
            incorrectCount={reviewIncorrect.length}
            retention={reviewRetention}
            flashcards={reviewFlashcards}
            incorrectFlashcards={reviewIncorrect}
            onContinue={() => setStage(getNextStage(2))}
          />
        </Case>
      )}

      {showNewSummary && (
        <Case caseValue={3}>
          <ReviseNewStage />
        </Case>
      )}

      {showNewSummary && (
        <Case caseValue={4}>
          <ReviseIncorrectSummary
            cardsCount={newFlashcards.length}
            correctCount={newCorrect.length}
            incorrectCount={newIncorrect.length}
            retention={newRetention}
            flashcards={newFlashcards}
            incorrectFlashcards={newIncorrect}
            onContinue={() => setStage(getNextStage(4))}
          />
        </Case>
      )}

      {showAllIncorrect && (
        <Case caseValue={5}>
          <ReviseAllStage />
        </Case>
      )}
      {/* Case 6 could be a final completion screen if needed */}
    </SwitchCase>
  );
}
