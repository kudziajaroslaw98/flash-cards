'use client';

import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function PostHogPageView() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  useEffect(() => {
    if (prevPathname && prevPathname !== pathname) {
      posthog.capture('$pageleave', { $pathname: prevPathname });
    }
    posthog.capture('$pageview');
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  return null;
}
