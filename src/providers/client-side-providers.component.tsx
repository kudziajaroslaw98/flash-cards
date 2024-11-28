'use client';

import SyncSessionProvider from './sync-session-provider.component';
import SessionProvider from './session-provider.component';
import ThemeProvider from './theme-provider.component';
import ToastProvider from './toast-provider.component';
import { domMax, LazyMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { store } from '#/store/redux.store';
import AppProvider from './app-context';
import { Provider } from 'react-redux';

export default function ClientSideProviders(props: PropsWithChildren) {
  return (
    <LazyMotion
      features={domMax}
      strict
    >
      <AppProvider>
        <Provider store={store}>
          <ToastProvider>
            <SessionProvider>
              <ThemeProvider>
                <SyncSessionProvider>{props.children}</SyncSessionProvider>
              </ThemeProvider>
            </SessionProvider>
          </ToastProvider>
        </Provider>
      </AppProvider>
    </LazyMotion>
  );
}
