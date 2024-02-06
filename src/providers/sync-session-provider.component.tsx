'use client';

import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useInterval from '#/hooks/use-interval.hook';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import { FlashCards } from '#/shared/types/local-storage-flash-card.type';
import { setFlashCards } from '#/store/reducers/flashcards.reducer';
import { setStats } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useSessionContext } from './session-provider.component';

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
  const words = useAppSelector(flashCardSelectors.selectFlashCards);
  const stats = useAppSelector(statsSelectors.selectStats);

  const { value: flashCardsLS } = useLocalStorage('words', {} as FlashCards);
  const { value: statsLS } = useLocalStorage('stats', DEFAULT_STATS);

  const { isLoggedIn } = useSessionContext();

  const initialRender = useRef<boolean>(true);
  // const MIN_IN_MS = 60_000;
  // const DEFAULT_SYNC_INTERVAL_IN_MS = MIN_IN_MS * 5;

  const sync = useCallback(() => {
    console.log('syncing');
    if (!isLoggedIn) return;
    console.log('syncing proceed');

    // const fetchBody = JSON.stringify({ words: words, stats: stats });

    // useFetch('/api/sync', {
    //   method: 'POST',
    //   body: JSON.stringify({ words }),
    // });
    console.log('🚀 ~ words:', words);
    console.log('🚀 ~ stats:', stats);
  }, [isLoggedIn, words, stats]);

  useInterval(
    () => {
      sync();
      initialRender.current = false;
    },
    null,
    // todo: uncomment when useFetch is implemented
    // isLoggedIn
    //   ? initialRender.current
    //     ? 0
    //     : DEFAULT_SYNC_INTERVAL_IN_MS
    //   : null,
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
    <SyncSessionContext.Provider value={{ sync }}>
      {props.children}
    </SyncSessionContext.Provider>
  );
}

export const useSyncSessionContext = () => {
  const context = useContext(SyncSessionContext);

  if (!context) {
    throw new Error(
      'useSyncSessionContext must be used within SyncSessionProvider',
    );
  }

  return context;
};
