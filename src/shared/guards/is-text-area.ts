import { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputComponentProps } from '#/components/_ui/input/input';
import type { TextAreaProps } from '#/components/_ui/text-area/text-area';

export default function isTextArea(
  item:
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | DropdownProps<unknown>,
): item is TextAreaProps {
  return item.type === 'textarea';
}
