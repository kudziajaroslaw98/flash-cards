import { useThemeContext } from '#/providers/theme-provider.component';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import Switch from '../ui/switch/switch.component';

interface ThemeSwitchProps {
  showLabel: boolean;
}

export default function ThemeSwitchComponent(props: ThemeSwitchProps) {
  const { changeTheme, isDarkMode } = useThemeContext();

  return (
    <Switch
      showLabel={props.showLabel}
      checkedLabel={'Dark mode'}
      uncheckedLabel={'Light mode'}
      onClick={changeTheme}
      value={isDarkMode}
    >
      {isDarkMode ? (
        <MoonIcon className='h-4 w-4' />
      ) : (
        <SunIcon className='h-4 w-4' />
      )}
    </Switch>
  );
}
