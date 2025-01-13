import {
  Children,
  cloneElement,
  type PropsWithChildren,
  type ReactElement,
} from 'react';

export type TriggerProps = {
  trigger: () => void;
} & PropsWithChildren;

export const Trigger = ({ children, trigger }: TriggerProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggerWithClick = (element: ReactElement<any>) =>
    cloneElement(element, {
      onClick: () => {
        element?.props?.onClick?.();
        trigger();
      },
    });

  return (
    <>
      {Children.map(children, (child) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        triggerWithClick(child as ReactElement<any>),
      )}
    </>
  );
};
