'use client';

import { PropsWithChildren, createContext, useCallback, useState } from 'react';
import type { ApiSyncResponse } from '#/types/api-sync-response.type';
import { useSessionContext } from './session-provider.component';
import type { ApiResponse } from '#/types/api-response.type';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import useInterval from '#/hooks/use-interval.hook';
import useFetch from '#/hooks/use-fetch.hook';
import { useAppContext } from './app-context';

export type SyncSessionContextType = {
  sync: () => void;
};

export const SyncSessionContext = createContext<SyncSessionContextType>({
  sync: () => null,
});

export default function SyncSessionProvider(
  props: Readonly<PropsWithChildren>,
) {
  const { fetch } = useFetch();

  const { isLoggedIn } = useSessionContext();
  const {
    metadata,
    theme,
    flashcards,
    sets,
    setFlashCards,
    setSets,
    updateMetadata,
  } = useAppContext();

  const [initialRender, setInitialRender] = useState(true);
  const MIN_IN_MS = 60_000;
  const DEFAULT_SYNC_INTERVAL_IN_MS = MIN_IN_MS * 30;

  const syncWithDB = useCallback(async () => {
    if (!isLoggedIn) return;

    const fetchBody = JSON.stringify({
      flashcards,
      sets,
      theme,
      metadata: metadata,
    });

    // TODO: Add error handling
    // TODO: Add Promise.all() and split sync to different endpoints

    const responsePromise = fetch<ApiResponse<ApiSyncResponse>>(
      API_ROUTES.SYNC,
      {
        method: 'POST',
        body: fetchBody,
      },
    );

    const response = await responsePromise;

    if (response.success) {
      updateMetadata(response.data.metadata);
      setFlashCards(response.data.flashcards);
      setSets(response.data.sets);
    }
  }, [isLoggedIn, metadata, flashcards, sets, theme]);

  const getInterval = () => {
    if (isLoggedIn) {
      if (initialRender) {
        return 1000;
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
