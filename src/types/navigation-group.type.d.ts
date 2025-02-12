import type { ReactNode } from 'react';
import type { NavigationAction } from './navigation-action.type';
import type { NavigationItem } from './navigation-item.type';

export type NavigationGroup = {
  type: 'group';
  icon?: ReactNode;
  label?: string;
  items: (NavigationItem | NavigationAction)[];
  divider?: true;
  visible?: boolean;
};
