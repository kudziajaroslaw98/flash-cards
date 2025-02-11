export type NavigationAction = {
  type: 'action';
  icon: ReactNode;
  label: string;
  indicator?: ReactNode;
  visible?: boolean;
  onClick?: ([...args]: unknown[]) => unknown;
};
