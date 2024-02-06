import type { ReactNode } from 'react';

export type NavigationItem = {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
};
