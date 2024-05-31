import {
  Button,
  type ButtonProps,
} from '#/components/ui/button/button.component';
import type { ReactNode } from 'react';

interface ToggleButtonProps extends ButtonProps {
  activeIcon?: ReactNode;
  inactiveIcon?: ReactNode;
  toggled: boolean;
  toggle: () => void;
}

export function ToggleButton(props: ToggleButtonProps) {
  const icon = (
    <>
      {props.toggled && props.activeIcon} {!props.toggled && props.inactiveIcon}
    </>
  );
  return (
    <Button
      onClick={(e) => {
        props.toggle();
        props?.onClick && props.onClick(e);
      }}
      icon={icon}
      {...props}
    ></Button>
  );
}
