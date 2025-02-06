import type { DateTimePickerProps } from '#/components/_ui/date-picker/date-picker';
import type { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputComponentProps } from '#/components/_ui/input/input';
import type { TagInputComponentProps } from '#/components/_ui/tag-input/tag-input';
import type { TextAreaProps } from '#/components/_ui/text-area/text-area';

export default function isTagInput(
  item:
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | DropdownProps<unknown>
    | DateTimePickerProps
    | Omit<TagInputComponentProps, 'value' | 'error' | 'valid'>,
): item is TagInputComponentProps {
  return item?.type === 'tags';
}
