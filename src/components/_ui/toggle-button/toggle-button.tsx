import { Button, type ButtonProps } from '#/components/_ui/button/button';
import { forwardRef, type ReactNode } from 'react';

type ToggleButtonProps =
  | ({
      animated?: false;
      activeIcon?: ReactNode;
      inactiveIcon?: ReactNode;
      toggled: boolean;
      toggle?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      toggleVariant?: 'outline' | 'text';
    } & ButtonProps)
  | ({
      animated?: true;
      animatedIcon?: ReactNode;
      toggled: boolean;
      toggle?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      toggleVariant?: 'outline' | 'text';
    } & ButtonProps);

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      toggled = true,
      toggle = () => {},
      toggleVariant = 'outline',
      ...props
    }: ToggleButtonProps,
    ref,
  ) => {
    const icon = () => {
      if (props.animated == false) {
        return toggled ? props.activeIcon : props.inactiveIcon;
      } else if (props.animated == true) {
        return props.animatedIcon;
      }
    };

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
          if (props?.onClick) {
            props.onClick(e);
          }
        }}
        icon={icon()}
        variant={getVariantType()}
        {...props}
      ></Button>
    );
  },
);

ToggleButton.displayName = 'ToggleButton';

export default ToggleButton;
