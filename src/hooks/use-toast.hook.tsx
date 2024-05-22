import { UUID } from '#/shared/types/uuid.type';
import { omit } from 'lodash';

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

export interface ToastModel {
  uuid: UUID;
  title: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'async';
  timeInSeconds?: number;
}

interface InternalToastModel extends ToastModel {
  dueTo: Date;
}

interface AsyncToastConfig {
  pendingTitle: string;
  successTitle: string;
  errorTitle: string;
}

export default function useToast() {
  const [toasts, setToast] = useState<ToastModel[]>([]);
  const [internalToasts, setInternalToasts] = useState<
    Record<UUID, InternalToastModel>
  >({});
  const intervalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(
    (toastUuid: UUID) => {
      const clonedToasts = { ...internalToasts };

      delete clonedToasts[toastUuid];

      setInternalToasts(clonedToasts);
    },
    [internalToasts],
  );

  const show = (toast: Omit<ToastModel, 'uuid'>) => {
    const uuid = v4() as UUID;
    const newToastSet = {
      ...internalToasts,
      [uuid]: {
        ...toast,
        uuid,
        dueTo: new Date(
          new Date().getTime() + (toast?.timeInSeconds ?? 1) * 1000,
        ),
      },
    };

    setInternalToasts(newToastSet);
  };

  const showAsync = (config: AsyncToastConfig, promise: Promise<unknown>) => {
    const uuid = v4() as UUID;
    const newToastSet = {
      ...internalToasts,
      [uuid]: {
        title: config.pendingTitle,
        type: 'async',
        uuid,
        dueTo: new Date(new Date().getTime() + 60 * 1000),
      },
    };

    setInternalToasts(newToastSet);

    promise
      .then(() => {
        close(uuid);
        show({
          title: config.successTitle,
          type: 'success',
          timeInSeconds: 3,
        });
      })
      .catch(() => {
        close(uuid);
        show({
          title: config.errorTitle,
          type: 'error',
          timeInSeconds: 3,
        });
      });
  };

  const clear = useCallback(() => {
    setInternalToasts({});
  }, []);

  const checkTimeouts = useCallback(() => {
    const now = new Date();

    Object.values(internalToasts).forEach((toast) => {
      if (now > toast.dueTo && toast.type !== 'async') {
        close(toast.uuid);
      }
    });
  }, [internalToasts, close]);

  useEffect(() => {
    if (
      Object.values(internalToasts).length === 0 &&
      intervalTimer.current !== null
    ) {
      clearInterval(intervalTimer.current!);
      intervalTimer.current = null;
    } else if (
      Object.values(internalToasts).length > 0 &&
      intervalTimer.current === null
    ) {
      intervalTimer.current = setInterval(() => {
        checkTimeouts();
      }, 100);
    }

    setToast(
      Object.values(internalToasts ?? []).map((toast) =>
        omit(toast, ['dueTo']),
      ),
    );

    return () => {
      clearInterval(intervalTimer.current!);
      intervalTimer.current = null;
    };
  }, [internalToasts, checkTimeouts]);

  return { toasts, show, showAsync, clear, close };
}
