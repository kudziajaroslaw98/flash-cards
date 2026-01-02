'use client';

import useAppStore from '#/store/app-store';
import type { ToastStepStatus } from '#/types/streaming-toast.type';
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useShallow } from 'zustand/shallow';

const stepIcons: Record<ToastStepStatus, React.ReactNode> = {
  pending: <Circle className='size-4 text-gray-400' />,
  active: <Loader2 className='size-4 animate-spin text-purple-500' />,
  completed: <CheckCircle className='size-4 text-green-500' />,
  error: <XCircle className='size-4 text-red-500' />,
};

export function StreamingToast() {
  const { streamingToast, stopStream } = useAppStore(
    useShallow((state) => ({
      streamingToast: state.streamingToast,
      stopStream: state.stopStream,
    }))
  );

  const { isOpen, header, message, steps, error } = streamingToast;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' as const }}
          className='fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'
        >
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
              {header}
            </h3>
            <button
              onClick={stopStream}
              className='text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
              aria-label='Stop streaming'
            >
              <XCircle className='size-5' />
            </button>
          </div>

          {steps.length > 0 && (
            <div className='mb-3 space-y-2'>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 text-sm'
                >
                  {stepIcons[step.status]}
                  <span
                    className={
                      step.status === 'completed'
                        ? 'text-gray-500 dark:text-gray-400'
                        : step.status === 'error'
                          ? 'text-red-500'
                          : step.status === 'active'
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-400 dark:text-gray-500'
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error ? (
            <p className='text-sm text-red-500'>{error}</p>
          ) : (
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {message}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
