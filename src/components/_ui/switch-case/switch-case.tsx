import { Children, isValidElement, type PropsWithChildren } from 'react';

export function SwitchCase(props: PropsWithChildren<{ condition: unknown }>) {
  const { condition, children } = props;

  if (children === null || children === undefined) {
    console.warn('SwitchCase: missing children');
    return null;
  }

  const filteredChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const props = child.props as { caseValue: unknown };

      if (props?.caseValue === undefined) {
        console.warn('SwitchCase: missing caseValue prop');
        return null;
      } else {
        return props.caseValue === condition ? child : null;
      }
    }

    return null;
  })?.filter((child) => child !== null);

  return <>{filteredChildren}</>;
}
