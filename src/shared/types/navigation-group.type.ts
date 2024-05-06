import type { ReactNode } from 'react';
import type { NavigationItem } from './navigation-item.type';

export type NavigationGroup = {
  type: 'group';
  icon?: ReactNode;
  label?: string;
  items: NavigationItem[];
  divider?: true;
};
