'use client';

import { AIStreamMediator } from '#/components/ai/ai-stream-mediator';
import { StreamingToast } from '#/components/ai/streaming-toast';
import { domMax, LazyMotion } from 'motion/react';
import type { PropsWithChildren } from 'react';
import AppProvider from './app-context';
import SessionProvider from './session-provider.component';
import ThemeProvider from './theme-provider.component';
import ToastProvider from './toast-provider.component';

export default function ClientSideProviders(props: PropsWithChildren) {
  return (
    <LazyMotion
      features={domMax}
      strict
    >
      <SessionProvider>
        <AppProvider>
          <ToastProvider>
            <ThemeProvider>
              {props.children}
              <AIStreamMediator />
              <StreamingToast />
            </ThemeProvider>
          </ToastProvider>
        </AppProvider>
      </SessionProvider>
    </LazyMotion>
  );
}
