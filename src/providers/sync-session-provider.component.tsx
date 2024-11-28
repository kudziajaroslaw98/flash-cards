'use client';

import { PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import { SETS_LOCAL_STORAGE_INIT } from '#/shared/defaults/sets-local-storage-init';
import { Metadata, MetadataModel } from '#/types//local-storage-metadata.type';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import { useSessionContext } from './session-provider.component';
import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { setStats } from '#/store/reducers/stats.reducer';
import { setSets } from '#/store/reducers/sets.reducer';
import useInterval from '#/hooks/use-interval.hook';

export type SyncSessionContextType = {
  sync: () => void;
};

export const SyncSessionContext = createContext<SyncSessionContextType>({
  sync: () => null,
});

export default function SyncSessionProvider(props: Readonly<PropsWithChildren>) {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(statsSelectors.selectStats);
  // const { fetch } = useFetch();
  // const { showAsync } = useToastContext();

  const { value: setsLS } = useLocalStorage({ key: 'sets', defaultValue: SETS_LOCAL_STORAGE_INIT });
  const { value: statsLS } = useLocalStorage({ key: 'stats', defaultValue: DEFAULT_STATS });
  const { value: themeLS, setToLocalStorage: setTheme } = useLocalStorage({
    key: 'theme',
    defaultValue: {
      theme: 'dark',
    },
  });
  const { value: metadata, setToLocalStorage: setMetadata } = useLocalStorage<
    MetadataModel[keyof MetadataModel],
    Metadata
  >({
    key: 'metadata',
    defaultValue: {
      lastSyncAt: null,
    },
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

    // const responsePromise = fetch<ApiResponse<ApiSyncResponse>>('ApiRoutes.SYNC', {
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
  }, [isLoggedIn, stats, themeLS, metadata]);

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
    if (Object.values(statsLS).length === 0) return;

    dispatch(setStats(statsLS));
  }, [statsLS]);

  useEffect(() => {
    if (Object.values(setsLS).length === 0) return;

    dispatch(setSets(setsLS));
  }, [setsLS]);

  return <SyncSessionContext.Provider value={{ sync: syncWithDB }}>{props.children}</SyncSessionContext.Provider>;
}
