import { Button, type ButtonProps } from '#/components/_ui/button/button';
import { forwardRef, type ReactNode } from 'react';

type ToggleButtonProps = {
  activeIcon?: ReactNode;
  inactiveIcon?: ReactNode;
  toggled: boolean;
  toggle: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  toggleVariant?: 'outline' | 'text';
} & ButtonProps;

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      activeIcon,
      inactiveIcon,
      toggled = true,
      toggle,
      toggleVariant = 'outline',
      ...props
    },
    ref,
  ) => {
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
        ref={ref}
        onClick={(e) => {
          toggle(e);
          props?.onClick && props.onClick(e);
        }}
        icon={icon}
        variant={getVariantType()}
        {...props}
      ></Button>
    );
  },
);

ToggleButton.displayName = 'ToggleButton';

export default ToggleButton;
