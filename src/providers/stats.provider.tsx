'use client';

import useLocalStorage from '#/hooks/use-local-storage.hook';
import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import { Stats } from '#/shared/types/local-storage-stats.type';
import { createContext, PropsWithChildren, useContext } from 'react';

export type StatsContextType = {
  setToLocalStorage: (_value: Stats) => void;
  value: Stats;
  update: (
    updatedValue: Stats[keyof Stats] | Stats,
    property?: keyof Stats,
  ) => void;
};

export const StatsContext = createContext<StatsContextType>({
  setToLocalStorage: () => {},
  value: DEFAULT_STATS,
  update: () => {},
});

export default function StatsProvider(props: Readonly<PropsWithChildren>) {
  const { value, setToLocalStorage } = useLocalStorage('stats', DEFAULT_STATS);

  const update = (
    updatedValue: Stats[keyof Stats] | Stats,
    property?: keyof Stats,
  ) => {
    let StatsClone = {};

    if (property) {
      StatsClone = {
        ...value,
        [property]: updatedValue,
      };
    } else {
      StatsClone = updatedValue;
    }

    setToLocalStorage(StatsClone as Stats);
  };

  return (
    <StatsContext.Provider value={{ value, setToLocalStorage, update }}>
      {props.children}
    </StatsContext.Provider>
  );
}

export const useStatsContext = () => {
  const context = useContext(StatsContext);

  if (!context) {
    throw new Error('useStatsContext must be used within StatsProvider');
  }

  return context;
};
