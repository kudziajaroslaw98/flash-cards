import { Button, type ButtonProps } from '#/components/_ui/button/button';
import { forwardRef, useCallback, type ReactNode } from 'react';

type ToggleButtonProps =
  | ({
      animated: false;
      activeIcon: ReactNode;
      inactiveIcon: ReactNode;
      animatedIcon?: ReactNode;
      toggled: boolean;
      toggle?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      toggleVariant?: 'outline' | 'text';
    } & ButtonProps)
  | ({
      animated: true;
      animatedIcon: ReactNode;
      activeIcon?: ReactNode;
      inactiveIcon?: ReactNode;
      toggled: boolean;
      toggle?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      toggleVariant?: 'outline' | 'text';
    } & ButtonProps);

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      animated = false,
      activeIcon,
      inactiveIcon,
      animatedIcon,
      toggled = true,
      toggle = () => {},
      toggleVariant = 'outline',
      ...props
    }: ToggleButtonProps,
    ref,
  ) => {
    const icon = useCallback(() => {
      if (animated) {
        return animatedIcon;
      } else {
        return toggled ? activeIcon : inactiveIcon;
      }
    }, [animated, activeIcon, inactiveIcon, animatedIcon]);

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
