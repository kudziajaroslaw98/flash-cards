import { useCallback, useEffect, useRef, useState } from 'react';
import uuid from '#/shared/utils/uuid.util';

export interface ToastModel {
  uuid: string;
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
    Record<string, InternalToastModel>
  >({});
  const intervalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(
    (toastUuid: string) => {
      const clonedToasts = { ...internalToasts };

      delete clonedToasts[toastUuid];

      setInternalToasts(clonedToasts);
    },
    [internalToasts],
  );

  const show = (toast: Omit<ToastModel, 'uuid'>) => {
    const uuidString = uuid();

    setInternalToasts((prev) => ({
      ...prev,
      [uuidString]: {
        ...toast,
        uuid: uuidString,
        dueTo: new Date(
          new Date().getTime() + (toast?.timeInSeconds ?? 1) * 1000,
        ),
      },
    }));
  };

  const showAsync = (config: AsyncToastConfig, promise: Promise<unknown>) => {
    const uuidString = uuid();

    setInternalToasts((prev) => ({
      ...prev,
      [uuidString]: {
        title: config.pendingTitle,
        type: 'async',
        uuid: uuidString,
        dueTo: new Date(new Date().getTime() + 60 * 1000),
      },
    }));

    promise
      .then(() => {
        setInternalToasts((prev) => ({
          ...prev,
          [uuidString]: {
            title: config.successTitle,
            type: 'success',
            uuid: uuidString,
            dueTo: new Date(new Date().getTime() + 3 * 1000),
          },
        }));
      })
      .catch(() => {
        setInternalToasts((prev) => ({
          ...prev,
          [uuidString]: {
            title: config.errorTitle,
            type: 'error',
            uuid: uuidString,
            dueTo: new Date(new Date().getTime() + 3 * 1000),
          },
        }));
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
      Object.values(internalToasts ?? []).map((toast) => ({
        ...toast,
        dueTo: undefined,
      })),
    );

    return () => {
      clearInterval(intervalTimer.current!);
      intervalTimer.current = null;
    };
  }, [internalToasts, checkTimeouts]);

  return { toasts, show, showAsync, clear, close };
}
