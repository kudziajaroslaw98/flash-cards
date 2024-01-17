import { PropsWithChildren } from 'react';

export interface ButtonParams {
  class?: string;
  disabled?: boolean;
  onClick: () => void;
}

export default function ButtonComponent(
  params: PropsWithChildren<ButtonParams>,
) {
  return (
    <button
      disabled={params.disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-md border border-transparent px-4 text-gray-50 transition-all active:scale-95 disabled:border-gray-300 disabled:bg-transparent disabled:text-gray-400 sm:w-auto md:h-10 dark:disabled:bg-transparent ${params.class}`}
      onClick={() => params.onClick()}
    >
      {params.children}
    </button>
  );
}
