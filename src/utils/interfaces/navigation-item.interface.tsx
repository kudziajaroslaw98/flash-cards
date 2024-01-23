import { ReactNode } from 'react';

export interface NavigationItem {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}
