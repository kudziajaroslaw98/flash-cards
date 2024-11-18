import { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import { InputComponentProps } from '#/components/_ui/input/input';
import { TextAreaProps } from '#/components/_ui/text-area/text-area';

export default function isDropdown(
  item:
    | DropdownProps<unknown>
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps,
): item is DropdownProps<unknown> {
  return item.type === 'dropdown';
}
