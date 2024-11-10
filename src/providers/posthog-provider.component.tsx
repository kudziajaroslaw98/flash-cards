'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { PropsWithChildren, useEffect } from 'react';

export default function CSPostHogProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
      capture_pageleave: true,
      capture_pageview: false,
    });
  }, []);
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
