'use client';

import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useFetch from '#/hooks/use-fetch.hook';
import useInterval from '#/hooks/use-interval.hook';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import { ApiResponse } from '#/shared/types/api/api-response.type';
import { ApiSyncResponse } from '#/shared/types/api/api-sync-response.type';
import { FlashCards } from '#/shared/types/local-storage-flash-card.type';
import {
  Metadata,
  MetadataModel,
} from '#/shared/types/local-storage-metadata.type';
import {
  setFlashCards,
  setFlashCardsAfterSync,
} from '#/store/reducers/flashcards.reducer';
import { setStats, setStatsAfterSync } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useSessionContext } from './session-provider.component';
import { useToastContext } from './toast-provider.component';

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
  const { fetch } = useFetch();
  const { show } = useToastContext();

  const { value: flashCardsLS } = useLocalStorage(
    'flashcards',
    {} as FlashCards,
  );
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
    updatedAt: null,
  });

  const { isLoggedIn } = useSessionContext();

  const shouldSync = useRef<boolean>(false);
  const initialRender = useRef<boolean>(true);
  const MIN_IN_MS = 60_000;
  const DEFAULT_SYNC_INTERVAL_IN_MS = MIN_IN_MS * 5;

  const syncWithDB = useCallback(async () => {
    console.log('syncing');
    if (!isLoggedIn) return;
    console.log('syncing proceed');

    const fetchBody = JSON.stringify({
      flashcards,
      stats,
      theme: themeLS.theme,
      lastSyncAt: metadata.lastSyncAt,
      updatedAt: metadata.updatedAt,
    });

    const response = await fetch<ApiResponse<ApiSyncResponse>>('/api/sync', {
      method: 'POST',
      body: fetchBody,
    });

    if (!response.success && response.error) {
      show({
        timeInSeconds: 10,
        title: response.error,
        type: 'error',
      });
    }

    if (response.success) {
      const flashcardsObject: FlashCards = {};

      response.data.flashcards.forEach((flashcard) => {
        flashcardsObject[flashcard.frontUuid] = flashcard;
      });

      setMetadata({
        lastSyncAt: response.data.lastSyncAt,
        updatedAt: metadata.updatedAt,
      });
      setTheme({ theme: response.data.theme });
      dispatch(setFlashCardsAfterSync(flashcardsObject));
      dispatch(setStatsAfterSync(response.data.stats));
    }
  }, [isLoggedIn, flashcards, stats, themeLS, metadata]);

  useInterval(
    () => {
      syncWithDB();
      initialRender.current = false;
    },
    isLoggedIn
      ? initialRender.current
        ? 0
        : DEFAULT_SYNC_INTERVAL_IN_MS
      : null,
  );

  useEffect(() => {
    if (Object.values(flashCardsLS).length === 0) return;

    dispatch(setFlashCards(flashCardsLS));
  }, [flashCardsLS]);

  useEffect(() => {
    if (Object.values(statsLS).length === 0) return;

    dispatch(setStats(statsLS));
  }, [statsLS]);

  return (
    <SyncSessionContext.Provider value={{ sync: syncWithDB }}>
      {props.children}
    </SyncSessionContext.Provider>
  );
}
