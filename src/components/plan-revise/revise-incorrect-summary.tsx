import { API_ROUTES } from '#/shared/defaults/api-routes';
import { parseStreamingJSON } from '#/shared/utils/parse-streaming-json';
import type { Flashcard } from '#/types/flash-card.type';
import { useCompletion } from '@ai-sdk/react';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';

export function ReviseIncorrectSummary({
  cardsCount,
  correctCount,
  incorrectCount,
  retention,
  flashcards,
  incorrectFlashcards,
  setStage,
}: {
  cardsCount: number;
  correctCount: number;
  incorrectCount: number;
  retention: number;
  flashcards: Flashcard[];
  incorrectFlashcards: string[];
  setStage: (value: number) => void;
}) {
  const [incorrectSummaries, setIncorrectSummaries] = useState<
    {
      simplifiedDefinition?: string;
      commonMisconceptions?: string;
      contextualExample?: string;
      keyTakeaway?: string;
      relatedConcepts?: string;
      mnemonic?: string;
      visualExample?: string;
    }[]
  >([]);

  const {
    complete: generateSummary,
    isLoading: generateSummaryLoading,
    completion: summaries,
  } = useCompletion({
    api: API_ROUTES.GENERATE_INCORRECT_REVIEW_SUMMARY,
  });

  const generateIncorrectSummaries = () => {
    const summaries = flashcards
      .filter((f) => incorrectFlashcards.some((uuid) => f.frontUuid === uuid))
      .map((f) => ({
        context: f.context,
        definition: f.definition,
        query: f.query,
      }));
    // generateSummary({ summaries });
    generateSummary('', { body: { summaries } });
  };

  useEffect(() => {
    console.log(summaries);
    const parsedJSON = parseStreamingJSON<{
      simplifiedDefinition?: string;
      commonMisconceptions?: string;
      contextualExample?: string;
      keyTakeaway?: string;
      relatedConcepts?: string;
      mnemonic?: string;
      visualExample?: string;
    }>(summaries);

    if (generateSummaryLoading && summaries) {
      setIncorrectSummaries([
        ...parsedJSON.completeObjects,
        {
          ...(parsedJSON.currentObject ?? {}),
        },
      ]);
    } else {
      setIncorrectSummaries(parsedJSON.completeObjects);
    }
    //  simplifiedDefinition: z.string(),
    //       commonMisconceptions: z.string(),
    //       contextualExample: z.string().optional(),
    //       keyTakeaway: z.string(),
    //       relatedConcepts: z.string().optional(),
    //       mnemonic: z.string().optional(),
    //       visualExample: z.string().optional(),
    // setIncorrectSummaries(summaries);
  }, [summaries, generateSummaryLoading]);

  useEffect(() => {
    generateIncorrectSummaries();
  }, []);

  return (
    <>
      <span>New cards summary</span>
      <div className='flex flex-col gap-2'>
        <span>Cards: {cardsCount}</span>
        <span>Correct: {correctCount}</span>
        <span>Incorrect: {incorrectCount}</span>
        <span>Retention: {retention}</span>
      </div>

      <div className='flex flex-col gap-6'>
        {incorrectSummaries &&
          incorrectSummaries?.map((summary, index) => (
            <div
              key={index}
              className='flex flex-col gap-2'
            >
              <div>
                <h4>
                  Summary For:{' '}
                  {
                    flashcards.find(
                      (f) => f.frontUuid === incorrectFlashcards[index],
                    )?.query
                  }
                </h4>
              </div>

              <div className='flex flex-col gap-2'>
                <h5>Definition:</h5>
                <p>
                  {
                    flashcards.find(
                      (f) => f.frontUuid === incorrectFlashcards[index],
                    )?.definition
                  }
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <h5>Simplified Definition:</h5>
                <p>{summary.simplifiedDefinition}</p>
              </div>

              <div className='flex flex-col gap-2'>
                <h5>Common Misconceptions:</h5>
                <p>{summary.commonMisconceptions}</p>
              </div>

              <div className='flex flex-col gap-2'>
                <h5>Key Takeaway:</h5>
                <p>{summary.keyTakeaway}</p>
              </div>

              {summary.contextualExample && (
                <div className='flex flex-col gap-2'>
                  <h5>Contextual Example:</h5>
                  <p>{summary.contextualExample}</p>
                </div>
              )}

              {summary.visualExample && (
                <div className='flex flex-col gap-2'>
                  <h5>Visual Example:</h5>
                  <p>{summary.visualExample}</p>
                </div>
              )}

              {summary.mnemonic && (
                <div className='flex flex-col gap-2'>
                  <h5>Mnemonics:</h5>
                  <p>{summary.mnemonic}</p>
                </div>
              )}

              {summary.relatedConcepts && (
                <div className='flex flex-col gap-2'>
                  <h5>Related Concepts:</h5>
                  <p>{summary.relatedConcepts}</p>
                </div>
              )}
            </div>
          ))}
      </div>

      <Button
        alt='Continue'
        label={'Continue'}
        icon={<ArrowRight className='h-4 w-4' />}
        iconPosition={'right'}
        onClick={() => {
          setStage(5);
        }}
        className='!w-full !max-w-xs'
        disabled={generateSummaryLoading}
      />
    </>
  );
}
