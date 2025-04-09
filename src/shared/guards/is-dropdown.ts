import type { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputDefinitions } from '#/types/input-types';

export default function isDropdown<T>(
  item: InputDefinitions<T>,
): item is DropdownProps<T> {
  return item.type === 'dropdown';
}
