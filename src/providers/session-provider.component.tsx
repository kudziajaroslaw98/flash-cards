'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User, UserAttributes } from '@supabase/supabase-js';
import { createClient } from '#/shared/utils/supabase/client';
import type { ApiResponse } from '#/types//api-response.type';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { usePathname, useRouter } from 'next/navigation';
import useFetch from '#/hooks/use-fetch.hook';

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
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();
  const { fetch } = useFetch();
  const [user, setUser] = useState<User | null>(null);
  const pickedPlan = user?.user_metadata?.stripe_subscribed_plan ?? null;
  const isPlanActive =
    user?.user_metadata?.stripe_subscription_status === 'active';

  const logOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.clear();
    router.refresh();
  };

  const checkSession = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
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
        isLoggedIn: user !== null,
        pickedPlan: pickedPlan,
        isPlanActive: isPlanActive,
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
