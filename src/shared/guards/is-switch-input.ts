import type { InputSwitchProps } from '#/components/_ui/input-switch/input-switch';
import type { InputDefinitions } from '#/types/input-types';

export default function isInputSwitch<T>(
  item: InputDefinitions<T>,
): item is InputSwitchProps {
  return item?.type === 'switch';
}
