import { cloneDeep, omit } from 'lodash';
import { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

interface ToastModel {
  uuid: UUID;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeInMs: number;
}

interface InternalToastModel extends ToastModel {
  dueTo: Date;
  timeout: () => void;
}

export default function useToast() {
  const [toasts, setToast] = useState<ToastModel[]>([]);
  const [internalToasts, setInternalToasts] = useState<
    Record<UUID, InternalToastModel>
  >({});
  const intervalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(
    (toastUuid: UUID) => {
      const clonedToasts = cloneDeep(internalToasts);
      delete clonedToasts[toastUuid];

      setInternalToasts(clonedToasts);
    },
    [internalToasts],
  );

  const show = useCallback(
    (toast: Omit<ToastModel, 'uuid'>) => {
      const uuid = v4() as UUID;

      setInternalToasts({
        ...toasts,
        [uuid]: {
          ...toast,
          uuid,
          dueTo: new Date(new Date().getTime() + toast.timeInMs),
          timeout: () => close(uuid),
        },
      });
    },
    [close, toasts],
  );

  const clear = useCallback(() => {
    setInternalToasts({});
  }, []);

  const checkTimeouts = useCallback(() => {
    const now = new Date();

    Object.values(internalToasts).forEach((toast) => {
      if (now > toast.dueTo) {
        toast.timeout();
      }
    });
  }, [internalToasts]);

  useEffect(() => {
    if (Object.values(internalToasts).length === 0) {
      intervalTimer.current = null;
    }

    intervalTimer.current = setInterval(() => {
      checkTimeouts();
    }, 100);

    setToast(
      Object.values(internalToasts).map((toast) =>
        omit(toast, ['dueTo', 'timeout']),
      ),
    );

    return () => {
      intervalTimer;
    };
  }, [internalToasts, checkTimeouts]);

  return { toasts, show, clear, close };
}