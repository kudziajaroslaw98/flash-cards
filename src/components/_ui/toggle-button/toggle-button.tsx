import { Button, type ButtonProps } from '#/components/_ui/button/button';
import { forwardRef, useCallback, type ReactNode } from 'react';

type BaseToggleButtonProps = {
  toggled: boolean;
  toggle?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  toggleVariant?: 'outline' | 'text';
  toggledLabel?: string;
} & ButtonProps;

type AnimatedToggleButtonProps = {
  animated: true;
  animatedIcon: ReactNode;
};

type NonAnimatedToggleButtonProps = {
  animated: false;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
};

type ToggleButtonProps = (
  | AnimatedToggleButtonProps
  | NonAnimatedToggleButtonProps
) &
  BaseToggleButtonProps;

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      animated = false,
      toggled = true,
      toggle = () => {},
      toggleVariant = 'outline',
      // @ts-expect-error false positive error
      animatedIcon,
      // @ts-expect-error false positive error
      activeIcon,
      // @ts-expect-error false positive error
      inactiveIcon,
      toggledLabel,
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
    }, [animated, toggled, props]);

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
        label={toggled ? toggledLabel : props.label}
      ></Button>
    );
  },
);

ToggleButton.displayName = 'ToggleButton';

export default ToggleButton;
