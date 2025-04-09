import { useSessionContext } from '#/providers/session-provider.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRedirectUnauthorized = ({
  redirectOnInactivePlan,
  inactivePathname,
  redirectNotLoggedIn,
  notLoggedInPathname,
}: {
  redirectOnInactivePlan?: boolean;
  inactivePathname?: string;
  redirectNotLoggedIn?: boolean;
  notLoggedInPathname?: string;
}) => {
  const { isLoggedIn, isPlanActive } = useSessionContext();
  const router = useRouter();

  const redirectUnauthorized = () => {
    if (redirectNotLoggedIn && !isLoggedIn) {
      router.push(notLoggedInPathname || APP_ROUTES.signIn);
    } else if (redirectOnInactivePlan && !isPlanActive) {
      router.push(inactivePathname || APP_ROUTES.pricing);
    }
  };

  useEffect(() => {
    redirectUnauthorized();
  }, [
    redirectOnInactivePlan,
    redirectNotLoggedIn,
    inactivePathname,
    notLoggedInPathname,
  ]);
};
