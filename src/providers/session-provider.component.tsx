'use client';

import {
  createClientComponentClient,
  Session,
} from '@supabase/auth-helpers-nextjs';
import { usePathname } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type SessionContextType = {
  isLoggedIn: boolean;
  session: Session | null;
  logOut: () => void;
};

export const SessionContext = createContext<SessionContextType>({
  isLoggedIn: false,
  session: null,
  logOut: () => {},
});

export default function SessionProvider(props: Readonly<PropsWithChildren>) {
  const supabase = createClientComponentClient();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  const logOut = async () => {
    await supabase.auth.signOut();

    setSession(null);
  };

  const checkSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();

    setSession(data?.session ?? null);
  }, [supabase.auth]);

  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  return (
    <SessionContext.Provider
      value={{ isLoggedIn: session !== null, session, logOut }}
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
