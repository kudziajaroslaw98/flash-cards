import type { ReactNode } from 'react';

export type NavigationItem = {
  type: 'item';
  icon: ReactNode;
  label: string;
  href: string;
  indicator?: ReactNode;
  active?: boolean;
  visible?: boolean;
};
