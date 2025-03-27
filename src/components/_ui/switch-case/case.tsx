import type { PropsWithChildren } from 'react';

export const Case = ({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  caseValue,
}: PropsWithChildren<{ caseValue: unknown }>) => {
  return children;
};
