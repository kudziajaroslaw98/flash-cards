'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session, User, UserAttributes } from '@supabase/supabase-js';
import { createClient } from '#/shared/utils/supabase/client';
import type { ApiResponse } from '#/types//api-response.type';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { usePathname, useRouter } from 'next/navigation';
import useFetch from '#/hooks/use-fetch.hook';

export type SessionContextType = {
  isLoggedIn: boolean;
  session: Session | null;
  logOut: () => void;
  updateUser: (user: UserAttributes) => void;
  deleteUser: () => void;
  user: User | null;
};

export const SessionContext = createContext<SessionContextType>({
  isLoggedIn: false,
  session: null,
  logOut: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  user: null,
});

export default function SessionProvider(props: Readonly<PropsWithChildren>) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();
  const { fetch } = useFetch();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const logOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    localStorage.clear();
    router.refresh();
  };

  const checkSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();

    setSession(data?.session ?? null);
    setUser(data?.session?.user ?? null);
  }, [supabase.auth]);

  const updateUser = async (user: UserAttributes) => {
    const { data, error } = await supabase.auth.updateUser(user);

    if (error === null) {
      setUser(data.user);
      checkSession();
    }
  };

  const deleteUser = async () => {
    const response: ApiResponse<unknown> = await fetch(API_ROUTES.USER_DELETE, {
      method: 'GET',
    });

    if (response.success) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      router.refresh();
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn: session !== null,
        session,
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
