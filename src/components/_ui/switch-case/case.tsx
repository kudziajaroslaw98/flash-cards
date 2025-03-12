import type { PropsWithChildren } from 'react';

export const Case = ({
  children,
  caseValue,
}: PropsWithChildren<{ caseValue: unknown }>) => {
  return children;
};
