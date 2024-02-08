import ButtonComponent from '#/components/ui/button/button.component';
import type { ReactNode } from 'react';

interface ToggleButtonProps extends BaseToggleButtonProps {
  type: 'icon-only';
  activeIcon?: ReactNode;
  inactiveIcon?: ReactNode;
}

interface BaseToggleButtonProps {
  class: string;
  onClick?: () => void;
  toggled: boolean;
  toggle: () => void;
}

export function ToggleButtonComponent(props: ToggleButtonProps) {
  const icon = (
    <>
      {props.toggled && props.activeIcon} {!props.toggled && props.inactiveIcon}
    </>
  );
  return (
    <ButtonComponent
      onClick={() => {
        props.toggle();
        props?.onClick && props.onClick();
      }}
      class={props.class}
      icon={icon}
    ></ButtonComponent>
  );
}
