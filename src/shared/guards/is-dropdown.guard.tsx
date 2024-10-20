import { DropdownProps } from '#/components/ui/dropdown/dropdown.component';

export default function isDropdown(
  item: DropdownProps<unknown>,
): item is DropdownProps<unknown> {
  return item.type === 'dropdown';
}
