import { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputDefinitions } from '#/types/input-types';

export default function isDropdown(
  item: InputDefinitions,
): item is DropdownProps<unknown> {
  return item.type === 'dropdown';
}
