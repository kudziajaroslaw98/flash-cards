import { useThemeContext } from '#/providers/theme-provider.component';
import Switch from '../_ui/switch/switch';
import { Moon, Sun } from 'lucide-react';

type ThemeSwitchProps = {
  showLabel: boolean;
  variant?: 'vertical' | 'vertical-reversed';
};

export default function ThemeSwitchComponent(props: ThemeSwitchProps) {
  const { changeTheme, isLightMode } = useThemeContext();

  return (
    <Switch
      onClick={changeTheme}
      value={isLightMode}
      showLabel={props.showLabel}
      checkedLabel='Light mode'
      uncheckedLabel='Dark mode'
      variant={props.variant ?? 'vertical'}
    >
      {isLightMode ? (
        <Sun className='h-4 w-4 fill-current' />
      ) : (
        <Moon className='h-4 w-4 fill-current' />
      )}
    </Switch>
  );
}
