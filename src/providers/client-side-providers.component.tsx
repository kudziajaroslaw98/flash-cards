'use client';

import { store } from '#/store/redux.store';
import { domMax, LazyMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import SyncSessionProvider from './sync-session-provider.component';
import ThemeProvider from './theme-provider.component';
import ToastProvider from './toast-provider.component';

/*************  ✨ Codeium Command ⭐  *************/
/******  6a6c67f3-50b7-450e-900a-60b805540f40  *******/ export default function ClientSideProviders(
  props: PropsWithChildren,
) {
  return (
    <LazyMotion
      features={domMax}
      strict
    >
      <Provider store={store}>
        <ToastProvider>
          {/* <SessionProvider> */}
          <ThemeProvider>
            <SyncSessionProvider>{props.children}</SyncSessionProvider>
          </ThemeProvider>
          {/* </SessionProvider> */}
        </ToastProvider>
      </Provider>
    </LazyMotion>
  );
}
