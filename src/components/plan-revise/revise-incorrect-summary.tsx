import { API_ROUTES } from '#/shared/defaults/api-routes';
import { parseStreamingJSON } from '#/shared/utils/parse-streaming-json';
import type { Flashcard } from '#/types/flash-card.type';
import { useCompletion } from '@ai-sdk/react';
import { ArrowRight, Dot, LoaderCircle } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Accordion } from '../_ui/accordion/accordion';
import { Button } from '../_ui/button/button';

// Define a type for the expected summary structure
type IncorrectSummary = {
  simplifiedDefinition?: string;
  commonMisconceptions?: string;
  contextualExample?: string;
  keyTakeaway?: string;
  relatedConcepts?: string;
  mnemonic?: string;
  visualExample?: string;
};

// Memoize the SummarySection component
const SummarySection = memo(function SummarySection({
  title,
  text,
}: {
  title?: string;
  text?: string;
}) {
  if (!text) return null; // Don't render if no text
  return (
    <div className='flex flex-col gap-2'>
      <span className='font-ibm-fredoka flex items-center gap-1 text-sm font-semibold'>
        <Dot className='size-4 text-green-500' />
        <span className='font-fredoka text-gray-600 dark:text-slate-200'>
          {title}
        </span>
      </span>
      <div className='prose w-full rounded-md bg-gray-100/60 p-2 px-5 text-sm text-gray-600 dark:bg-slate-900/60 dark:text-slate-300 dark:prose-strong:text-slate-200'>
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
});

export const ReviseIncorrectSummary = ({
  cardsCount,
  correctCount,
  incorrectCount,
  retention,
  flashcards,
  incorrectFlashcards,
  onContinue,
}: {
  cardsCount: number;
  correctCount: number;
  incorrectCount: number;
  retention: number;
  flashcards: Flashcard[];
  incorrectFlashcards: string[];
  onContinue: () => void;
}) => {
  const [incorrectSummaries, setIncorrectSummaries] = useState<
    IncorrectSummary[]
  >([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const {
    complete: generateSummary,
    isLoading: generateSummaryLoading,
    completion: summaries,
    error,
  } = useCompletion({
    api: API_ROUTES.GENERATE_INCORRECT_REVIEW_SUMMARY,
    onFinish: () => setHasGenerated(true), // Mark generation as attempted
  });

  // Prepare summaries for API call only when needed and inputs are valid
  useEffect(() => {
    if (
      incorrectFlashcards &&
      incorrectFlashcards.length > 0 &&
      flashcards &&
      flashcards.length > 0 &&
      !hasGenerated && // Only generate once per mount/prop change
      !generateSummaryLoading // Don't generate if already loading
    ) {
      const summariesPayload = flashcards
        .filter((f) => incorrectFlashcards.includes(f.frontUuid))
        .map((f) => ({
          frontUuid: f.frontUuid, // Include UUID to match results later
          context: f.context,
          definition: f.definition,
          query: f.query,
        }));

      if (summariesPayload.length > 0) {
        generateSummary('', { body: { summaries: summariesPayload } });
      } else {
        setHasGenerated(true); // Mark as generated even if no incorrect cards found
      }
    } else if (incorrectFlashcards?.length === 0) {
      setHasGenerated(true); // No incorrect cards, no need to generate
      setIncorrectSummaries([]); // Clear any previous summaries
    }
    // Dependency array ensures this runs only when relevant props change or generation finishes
  }, [
    incorrectFlashcards,
    flashcards,
    hasGenerated,
    generateSummaryLoading,
    generateSummary,
  ]);

  // Parse the streaming JSON completion
  useEffect(() => {
    if (summaries) {
      const parsedResult = parseStreamingJSON<IncorrectSummary>(summaries);
      // Ensure we only update if the parsed data is different to avoid loops
      if (
        JSON.stringify(parsedResult.completeObjects) !==
        JSON.stringify(incorrectSummaries)
      ) {
        setIncorrectSummaries(parsedResult.completeObjects);
      }
    }
  }, [summaries]); // Only depends on the raw completion string

  const getFlashcardById = (uuid: string) =>
    flashcards.find((f) => f.frontUuid === uuid);

  return (
    <div className='flex w-full flex-col items-center gap-8'>
      {/* Summary Stats */}
      <div className='flex w-full max-w-2xl flex-col gap-2'>
        <span className='font-fredoka font-semibold text-gray-600 dark:text-slate-200'>
          Stage Summary
        </span>
        <div className='flex w-full flex-wrap items-center gap-3 text-sm leading-3 text-gray-500 dark:text-slate-300'>
          <span>{cardsCount} cards</span>
          <span className='text-gray-200'>|</span>
          <span className='text-green-500'>{correctCount} correct</span>
          <span className='text-gray-200'>|</span>
          <span className='text-orange-500'>{incorrectCount} incorrect</span>
          <span className='text-gray-200'>|</span>
          <span>{(retention * 100).toFixed(1)}% retention</span>
        </div>
      </div>

      {/* Incorrect Flashcard Summaries Section */}
      {incorrectFlashcards.length > 0 && (
        <div className='flex w-full max-w-2xl flex-col gap-4'>
          <span className='font-fredoka font-semibold text-gray-600 dark:text-slate-200'>
            Review Explanations for Incorrect Cards
          </span>

          {generateSummaryLoading && (
            <div className='flex w-full flex-col items-center justify-center gap-4'>
              <LoaderCircle className='size-6 animate-spin text-green-500' />
              <span className='flex w-full animate-pulse justify-center py-4 text-center text-lg text-gray-500 dark:text-slate-400'>
                Generating explanations...
              </span>
            </div>
          )}

          {error && !generateSummaryLoading && (
            <p className='text-center text-sm text-red-500'>
              Could not generate explanations: {error.message}
            </p>
          )}

          {!generateSummaryLoading &&
            !error &&
            incorrectSummaries.length > 0 && (
              <Accordion>
                {incorrectFlashcards.map((cardUuid, index) => {
                  const card = getFlashcardById(cardUuid);
                  const summary = incorrectSummaries[index]; // Assuming order matches
                  if (!card || !summary) return null; // Handle potential mismatches

                  return (
                    <Accordion.Item
                      key={cardUuid}
                      title={
                        <div className='flex items-center gap-2 font-medium'>
                          <span>{card.query || card.context}</span>
                        </div>
                      }
                    >
                      <div className='flex flex-col gap-4'>
                        <SummarySection
                          title='Original Definition/Answer:'
                          text={card.definition || card.answer1}
                        />
                        <SummarySection
                          title='Simplified Explanation'
                          text={summary.simplifiedDefinition}
                        />
                        <SummarySection
                          title='Common Misconceptions'
                          text={summary.commonMisconceptions}
                        />
                        <SummarySection
                          title='Key Takeaway'
                          text={summary.keyTakeaway}
                        />
                        <SummarySection
                          title='Contextual Example'
                          text={summary.contextualExample}
                        />
                        <SummarySection
                          title='Related Concepts'
                          text={summary.relatedConcepts}
                        />
                        <SummarySection
                          title='Mnemonic Tip'
                          text={summary.mnemonic}
                        />
                        <SummarySection
                          title='Visual Idea'
                          text={summary.visualExample}
                        />
                      </div>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
        </div>
      )}

      {/* Continue Button */}
      <Button
        alt='Continue to next stage'
        label={'Continue'}
        icon={<ArrowRight className='h-4 w-4' />}
        iconPosition={'right'}
        onClick={onContinue}
        className='!w-full !max-w-xs'
        disabled={generateSummaryLoading} // Disable while loading summaries
      />
    </div>
  );
};
