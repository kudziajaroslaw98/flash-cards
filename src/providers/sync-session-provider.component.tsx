'use client';

import { PropsWithChildren, createContext, useCallback, useState } from 'react';
import { Metadata, MetadataModel } from '#/types//local-storage-metadata.type';
import { useSessionContext } from './session-provider.component';
import useLocalStorage from '#/hooks/use-local-storage.hook';
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
  // const { fetch } = useFetch();
  // const { showAsync } = useToastContext();

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
  }, [isLoggedIn, themeLS, metadata]);

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

  return (
    <SyncSessionContext.Provider value={{ sync: syncWithDB }}>
      {props.children}
    </SyncSessionContext.Provider>
  );
}
