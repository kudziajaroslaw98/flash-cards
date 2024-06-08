import {
  Button,
  type ButtonProps,
} from '#/components/ui/button/button.component';
import { type ReactNode } from 'react';

interface ToggleButtonProps extends ButtonProps {
  activeIcon?: ReactNode;
  inactiveIcon?: ReactNode;
  toggled: boolean;
  toggle: () => void;
  toggleVariant?: 'outline' | 'text';
}

export function ToggleButton({
  activeIcon,
  inactiveIcon,
  toggled = true,
  toggle,
  toggleVariant = 'outline',
  ...props
}: ToggleButtonProps) {
  const icon = (
    <>
      {toggled && activeIcon} {!toggled && inactiveIcon}
    </>
  );

  const getVariantType = () => {
    if (toggled) {
      if (toggleVariant === 'outline') {
        return 'primary';
      }
      return 'primary-text';
    }
    if (toggleVariant === 'text') {
      return 'disabled-text';
    }
    return 'disabled-outline';
  };

  return (
    <Button
      onClick={(e) => {
        toggle();
        props?.onClick && props.onClick(e);
      }}
      icon={icon}
      variant={getVariantType()}
      {...props}
    ></Button>
  );
}
