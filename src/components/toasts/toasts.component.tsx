'use client';

import { ToastModel } from '#/hooks/use-toast.hook';
import { useToastContext } from '#/providers/toast-provider.component';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

export default function ToastsComponent() {
  const { toasts, close } = useToastContext();

  const ToastTextClass = (toast: ToastModel) => {
    switch (toast.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'async':
        return 'text-violet-500';
      default:
        return 'text-gray-500';
    }
  };

  const ToastBodyClass = (toast: ToastModel) => {
    switch (toast.type) {
      case 'success':
        return 'border-green-400 dark:border-green-950/70 hover:bg-green-100 dark:hover:bg-green-950';
      case 'error':
        return 'border-red-400 dark:border-red-950/70 hover:bg-red-100 dark:hover:bg-red-950';
      case 'warning':
        return 'border-yellow-400 dark:border-yellow-950/70 hover:bg-yellow-100 dark:hover:bg-yellow-950';
      case 'async':
        return 'border-violet-400 dark:border-violet-950/70 hover:bg-violet-100 dark:hover:bg-violet-950';
      case 'info':
        return 'border-blue-400 dark:border-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-950';
    }
  };

  const toastIcons = (toast: ToastModel) => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className='h-6 w-6' />;
      case 'error':
        return <XCircleIcon className='h-6 w-6' />;
      case 'warning':
        return <ExclamationCircleIcon className='h-6 w-6' />;
      case 'async':
        return <ArrowPathIcon className='h-6 w-6 animate-spin' />;
      case 'info':
        return <InformationCircleIcon className='h-6 w-6' />;
    }
  };

  return (
    <div className='absolute right-0 top-16 z-40 flex h-auto w-full flex-col gap-2 overflow-x-clip px-4 sm:right-4 sm:px-0 md:max-w-80'>
      <AnimatePresence>
        {toasts?.map((toast) => (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key={toast.uuid}
            onClick={() => close(toast.uuid)}
            className={`${ToastBodyClass(
              toast,
            )} flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-gray-50 p-2 transition-all duration-300 ease-in-out  dark:bg-slate-900`}
          >
            <div
              className={`flex h-full w-8 items-center justify-center ${ToastTextClass(
                toast,
              )}`}
            >
              {toastIcons(toast)}
            </div>

            <div className='flex h-full w-full flex-col gap-2 px-4'>
              <span className={`${ToastTextClass(toast)}`}>{toast.title}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
