'use client';

import useAppStore from '#/store/app-store';
import type { User, UserAttributes } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
} from 'react';
import { useShallow } from 'zustand/shallow';

export type SessionContextType = {
  isLoggedIn: boolean;
  logOut: () => void;
  updateUser: (user: UserAttributes) => void;
  deleteUser: () => void;
  user: User | null;
  pickedPlan: string | null;
  isPlanActive: boolean;
};

export const SessionContext = createContext<SessionContextType>({
  isLoggedIn: false,
  logOut: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  user: null,
  pickedPlan: null,
  isPlanActive: false,
});

export default function SessionProvider(props: Readonly<PropsWithChildren>) {
  const pathname = usePathname();

  // Use Zustand store
  const {
    user,
    isLoggedIn,
    pickedPlan,
    isPlanActive,
    logOut,
    updateUser,
    deleteUser,
    checkSession,
  } = useAppStore(
    useShallow((state) => ({
      user: state.user,
      isLoggedIn: state.isLoggedIn,
      pickedPlan: state.pickedPlan,
      isPlanActive: state.isPlanActive,
      logOut: state.logOut,
      updateUser: state.updateUser,
      deleteUser: state.deleteUser,
      checkSession: state.checkSession,
    }))
  );

  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        pickedPlan,
        isPlanActive,
        user,
        logOut,
        updateUser,
        deleteUser,
      }}
    >
      {props.children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }

  return context;
};
