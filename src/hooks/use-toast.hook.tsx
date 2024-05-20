import { UUID } from '#/shared/types/uuid.type';
import { omit } from 'lodash';

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

export interface ToastModel {
  uuid: UUID;
  title: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeInSeconds: number;
}

interface InternalToastModel extends ToastModel {
  dueTo: Date;
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
        dueTo: new Date(new Date().getTime() + toast.timeInSeconds * 1000),
      },
    };

    setInternalToasts(newToastSet);
  };

  const clear = useCallback(() => {
    setInternalToasts({});
  }, []);

  const checkTimeouts = useCallback(() => {
    const now = new Date();

    Object.values(internalToasts).forEach((toast) => {
      if (now > toast.dueTo) {
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

  return { toasts, show, clear, close };
}
