import { useThemeContext } from '#/providers/theme-provider.component';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import Switch from '../_ui/switch/switch';

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
        <SunIcon className='h-4 w-4' />
      ) : (
        <MoonIcon className='h-4 w-4' />
      )}
    </Switch>
  );
}
