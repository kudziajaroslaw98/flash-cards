import { API_ROUTES } from '#/shared/defaults/api-routes';
import { parseStreamingJSON } from '#/shared/utils/parse-streaming-json';
import type { Flashcard } from '#/types/flash-card.type';
import { useCompletion } from '@ai-sdk/react';
import { ArrowRight, Dot } from 'lucide-react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Accordion } from '../_ui/accordion/accordion';
import { Button } from '../_ui/button/button';
export function ReviseIncorrectSummary({
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
    console.log('🚀 ~ :71 ~ useEffect ~ parsedJSON:', parsedJSON);

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
    if (
      !incorrectFlashcards ||
      !flashcards ||
      incorrectFlashcards.length === 0 ||
      flashcards.length === 0 ||
      generateSummaryLoading
    ) {
      return;
    }

    generateIncorrectSummaries();
  }, [incorrectFlashcards, flashcards]);

  const SummarySection = ({
    title,
    text,
  }: {
    title?: string;
    text?: string;
  }) => {
    return (
      <div className='flex flex-col gap-2'>
        <span className='flex items-center gap-1 text-sm font-semibold'>
          <Dot className='size-4 text-green-500' />
          <span className='text-gray-600 dark:text-slate-200'>{title}</span>
        </span>

        <div className='prose w-full rounded-md bg-gray-100/60 p-2 px-5 text-sm text-gray-600 dark:bg-slate-900/60 dark:text-slate-300'>
          <Markdown>{text}</Markdown>
        </div>
      </div>
    );
  };

  return (
    <div className='flex w-full flex-col items-center gap-8'>
      <div className='flex w-full max-w-2xl flex-col gap-2'>
        <span className='font-semibold dark:text-slate-200'>
          New cards summary
        </span>

        <div className='flex w-full flex-wrap items-center gap-3 text-sm leading-3 text-gray-500 dark:text-slate-300'>
          <span>{cardsCount} cards</span>

          <span className='text-gray-200'>|</span>

          <span className='text-green-500'>{correctCount} correct</span>

          <span className='text-gray-200'>|</span>

          <span className='text-orange-500'>{incorrectCount} incorrect</span>

          <span className='text-gray-200'>|</span>

          <span>{retention * 100}% retention</span>
        </div>
      </div>

      <div className='flex w-full max-w-2xl flex-col gap-4'>
        <span className='font-semibold dark:text-slate-200'>
          Incorrect flashcard summaries
        </span>

        <Accordion>
          {incorrectSummaries &&
            incorrectSummaries?.map((summary, index) => (
              <Accordion.Item
                key={index}
                title={
                  <div className='flex items-center gap-2 font-medium'>
                    <span>
                      {
                        flashcards.find(
                          (f) => f.frontUuid === incorrectFlashcards[index],
                        )?.query
                      }
                    </span>
                  </div>
                }
              >
                <div className='flex flex-col gap-4'>
                  <SummarySection
                    title='Definition:'
                    text={
                      flashcards.find(
                        (f) => f.frontUuid === incorrectFlashcards[index],
                      )?.definition
                    }
                  />

                  <SummarySection
                    title='Simplified Definition'
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

                  {summary.contextualExample && (
                    <SummarySection
                      title='Contextual Example'
                      text={summary.contextualExample}
                    />
                  )}

                  {summary.relatedConcepts && (
                    <SummarySection
                      title='Related Concepts'
                      text={summary.relatedConcepts}
                    />
                  )}

                  {summary.mnemonic && (
                    <SummarySection
                      title='Mnemonic'
                      text={summary.mnemonic}
                    />
                  )}

                  {summary.visualExample && (
                    <SummarySection
                      title='Visual Example'
                      text={summary.visualExample}
                    />
                  )}
                </div>
              </Accordion.Item>
            ))}
        </Accordion>
      </div>

      <Button
        alt='Continue'
        label={'Continue'}
        icon={<ArrowRight className='h-4 w-4' />}
        iconPosition={'right'}
        onClick={onContinue}
        className='!w-full !max-w-xs'
        disabled={generateSummaryLoading}
      />
    </div>
  );
}
