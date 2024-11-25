'use client';

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Metadata, MetadataModel } from '#/types//local-storage-metadata.type';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { FlashCards } from '#/types//local-storage-flash-card.type';
import { setFlashCards } from '#/store/reducers/flashcards.reducer';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import { useSessionContext } from './session-provider.component';
import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { setStats } from '#/store/reducers/stats.reducer';
import { Sets } from '#/types//local-storage-sets.type';
import { setSets } from '#/store/reducers/sets.reducer';
import useInterval from '#/hooks/use-interval.hook';

export type SyncSessionContextType = {
  sync: () => void;
};

export const SyncSessionContext = createContext<SyncSessionContextType>({
  sync: () => null,
});

export default function SyncSessionProvider(
  props: Readonly<PropsWithChildren>,
) {
  const dispatch = useAppDispatch();
  const flashcards = useAppSelector(flashCardSelectors.selectFlashCardsArray);
  const stats = useAppSelector(statsSelectors.selectStats);
  // const { fetch } = useFetch();
  // const { showAsync } = useToastContext();

  const { value: flashCardsLS } = useLocalStorage('flashcards', {
    'c5f20e37-c4c6-4a76-b987-4ab0adcf1ae5': {
      frontUuid: 'c5f20e37-c4c6-4a76-b987-4ab0adcf1ae5',
      question: "What's the meaning of word below?",
      questionAddition: 'Lazy',
      answer: 'Unwilling to work or use energy.',
      order: 1,
      weight: 1,
    },
    '4d49e5e0-54e9-44de-b4b8-c654c95878fd': {
      frontUuid: '4d49e5e0-54e9-44de-b4b8-c654c95878fd',
      question: "What's the meaning of word below?",
      questionAddition: 'Bright',
      answer: 'Giving off lots of light; intelligent or clever.',
      order: 2,
      weight: 1,
    },
    '757a6f43-2dc2-4d58-ba2d-5694defa0eab': {
      frontUuid: '757a6f43-2dc2-4d58-ba2d-5694defa0eab',
      question: "What's the meaning of word below?",
      questionAddition: 'Quick',
      answer: 'Happening or done with great speed.',
      order: 3,
      weight: 1,
    },
    'b03e05d5-c42d-4808-a621-1ac2fc4abed6': {
      frontUuid: 'b03e05d5-c42d-4808-a621-1ac2fc4abed6',
      question: "What's the meaning of word below?",
      questionAddition: 'Happy',
      answer: 'Feeling or showing pleasure or contentment.',
      order: 4,
      weight: 1,
    },
    'aa7054e8-277b-432c-be39-5696351d1767': {
      frontUuid: 'aa7054e8-277b-432c-be39-5696351d1767',
      question: "What's the meaning of word below?",
      questionAddition: 'Soft',
      answer: 'Not hard or firm to the touch.',
      order: 5,
      weight: 1,
    },
    'b5cc2f5e-c7fb-4f88-b9ec-b6259ac97da2': {
      frontUuid: 'b5cc2f5e-c7fb-4f88-b9ec-b6259ac97da2',
      question: "What's the meaning of word below?",
      questionAddition: 'Neat',
      answer: 'Tidy and organized.',
      order: 6,
      weight: 1,
    },
    '288a8828-25aa-4ee0-9ac3-b038a5ee4314': {
      frontUuid: '288a8828-25aa-4ee0-9ac3-b038a5ee4314',
      question: "What's the meaning of word below?",
      questionAddition: 'Kind',
      answer: 'Being nice and considerate to others.',
      order: 7,
      weight: 1,
    },
    'c9ac5033-4bff-4cbf-9cf1-18e1581e658d': {
      frontUuid: 'c9ac5033-4bff-4cbf-9cf1-18e1581e658d',
      question: "What's the meaning of word below?",
      questionAddition: 'Quickly',
      answer: 'At a fast speed; rapidly.',
      order: 8,
      weight: 1,
    },
    '05b49a47-00f1-4fe0-87c9-d1b435fa7043': {
      frontUuid: '05b49a47-00f1-4fe0-87c9-d1b435fa7043',
      question: "What's the meaning of word below?",
      questionAddition: 'Cold',
      answer: 'Having a low temperature; not warm.',
      order: 9,
      weight: 1,
    },
    'c3b37bbc-266e-4326-934d-886a385d1996': {
      frontUuid: 'c3b37bbc-266e-4326-934d-886a385d1996',
      question: "What's the meaning of word below?",
      questionAddition: 'Funny',
      answer: 'Causing laughter or amusement.',
      order: 10,
      weight: 1,
    },
  } as FlashCards);
  const { value: setsLS } = useLocalStorage('sets', {
    '8059ca9e-15ec-42d2-9291-c76f0bece6d7': {
      frontUuid: '8059ca9e-15ec-42d2-9291-c76f0bece6d7',
      name: 'Everyday Vocabulary Basics',
      description:
        'A set of simple and common words with their meanings, perfect for daily conversations and improving basic English vocabulary.',
      category: 'Language Learning',
      isFavourite: false,
      flashCards: [
        'c5f20e37-c4c6-4a76-b987-4ab0adcf1ae5',
        '757a6f43-2dc2-4d58-ba2d-5694defa0eab',
        'aa7054e8-277b-432c-be39-5696351d1767',
        '288a8828-25aa-4ee0-9ac3-b038a5ee4314',
        '05b49a47-00f1-4fe0-87c9-d1b435fa7043',
        '4d49e5e0-54e9-44de-b4b8-c654c95878fd',
      ],
      hardlink: 'everyday-vocabulary-basics',
    },
  } as Sets);
  const { value: statsLS } = useLocalStorage('stats', DEFAULT_STATS);
  const { value: themeLS, setToLocalStorage: setTheme } = useLocalStorage(
    'theme',
    {
      theme: 'dark',
    },
  );
  const { value: metadata, setToLocalStorage: setMetadata } = useLocalStorage<
    MetadataModel[keyof MetadataModel],
    Metadata
  >('metadata', {
    lastSyncAt: null,
  });

  const { isLoggedIn } = useSessionContext();

  const [initialRender, setInitialRender] = useState(true);
  const MIN_IN_MS = 60_000;
  const DEFAULT_SYNC_INTERVAL_IN_MS = MIN_IN_MS * 1;

  const syncWithDB = useCallback(async () => {
    setTheme(themeLS);
    setMetadata(metadata);
    return;
    // TODO: finish when all functionality is implemented

    // console.log('syncing');
    // if (!isLoggedIn) return;
    // console.log('syncing proceed');

    // const fetchBody = JSON.stringify({
    //   flashcards,
    //   stats,
    //   theme: themeLS.theme,
    //   lastSyncAt: metadata.lastSyncAt,
    // });

    // const responsePromise = fetch<ApiResponse<ApiSyncResponse>>('/api/sync', {
    //   method: 'POST',
    //   body: fetchBody,
    // });

    // showAsync(
    //   {
    //     pendingTitle: 'Syncing in progress',
    //     successTitle: 'Syncing succeeded',
    //     errorTitle: 'Syncing failed',
    //   },
    //   responsePromise,
    // );

    // const response = await responsePromise;

    // if (response.success) {
    //   const flashcardsObject: FlashCards = {};

    //   response.data.flashcards.forEach((flashcard) => {
    //     flashcardsObject[flashcard.frontUuid] = flashcard;
    //   });

    //   setMetadata({
    //     lastSyncAt: response.data.lastSyncAt,
    //   });
    //   setTheme({ theme: response.data.theme });
    //   dispatch(setFlashCardsAfterSync(flashcardsObject));
    //   dispatch(setStatsAfterSync(response.data.stats));
    // }
  }, [isLoggedIn, flashcards, stats, themeLS, metadata]);

  const getInterval = () => {
    if (isLoggedIn) {
      if (initialRender) {
        return 0;
      }
      return DEFAULT_SYNC_INTERVAL_IN_MS;
    }
    return null;
  };

  useInterval(() => {
    syncWithDB();
    setInitialRender(false);
  }, getInterval());

  useEffect(() => {
    if (Object.values(flashCardsLS).length === 0) return;

    dispatch(setFlashCards(flashCardsLS));
  }, [flashCardsLS]);

  useEffect(() => {
    if (Object.values(statsLS).length === 0) return;

    dispatch(setStats(statsLS));
  }, [statsLS]);

  useEffect(() => {
    if (Object.values(setsLS).length === 0) return;

    dispatch(setSets(setsLS));
  }, [setsLS]);

  return (
    <SyncSessionContext.Provider value={{ sync: syncWithDB }}>
      {props.children}
    </SyncSessionContext.Provider>
  );
}
