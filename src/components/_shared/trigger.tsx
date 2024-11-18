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
  const triggerWithClick = (element: ReactElement) =>
    cloneElement(element, {
      onClick: () => {
        element?.props?.onClick?.();
        trigger();
      },
    });

  return (
    <>
      {Children.map(children, (child) =>
        triggerWithClick(child as ReactElement),
      )}
    </>
  );
};
