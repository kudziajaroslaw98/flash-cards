'use client';

import { store } from '#/store/redux.store';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import SessionProvider from './session-provider.component';
import StatsProvider from './stats.provider';
import SyncSessionProvider from './sync-session-provider.component';
import ThemeProvider from './theme-provider.component';
import ToastProvider from './toast-provider.component';

export default function ClientSideProviders(props: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <SessionProvider>
          <ThemeProvider>
            <StatsProvider>
              <SyncSessionProvider>{props.children}</SyncSessionProvider>
            </StatsProvider>
          </ThemeProvider>
        </SessionProvider>
      </ToastProvider>
    </Provider>
  );
}
