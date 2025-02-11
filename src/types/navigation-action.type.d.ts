import type { ReactNode } from 'react';

export type NavigationAction = {
  type: 'action';
  icon: ReactNode;
  label: string;
  indicator?: ReactNode;
  visible?: boolean;
  onClick?: () => unknown;
};
