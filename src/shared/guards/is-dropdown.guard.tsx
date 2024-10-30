import { DropdownProps } from '#/components/ui/dropdown/dropdown.component';
import { InputComponentProps } from '#/components/ui/input/input.component';
import { TextAreaProps } from '#/components/ui/text-area/text-area.component';

export default function isDropdown(
  item:
    | DropdownProps<unknown>
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps,
): item is DropdownProps<unknown> {
  return item.type === 'dropdown';
}
