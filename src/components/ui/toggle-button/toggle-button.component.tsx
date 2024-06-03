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

export function ToggleButton({
  activeIcon,
  inactiveIcon,
  toggle,
  toggled,
  ...props
}: ToggleButtonProps) {
  const icon = (
    <>
      {toggled && activeIcon} {!toggled && inactiveIcon}
    </>
  );
  return (
    <Button
      onClick={(e) => {
        toggle();
        toggle();
        props?.onClick && props.onClick(e);
      }}
      icon={icon}
      {...props}
    ></Button>
  );
}
