import { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import { InputComponentProps } from '#/components/_ui/input/input';
import type { TagInputComponentProps } from '#/components/_ui/tag-input/tag-input';
import { TextAreaProps } from '#/components/_ui/text-area/text-area';

export default function isDropdown(
  item:
    | DropdownProps<unknown>
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | Omit<TagInputComponentProps, 'value' | 'error' | 'valid'>,
): item is DropdownProps<unknown> {
  return item.type === 'dropdown';
}
