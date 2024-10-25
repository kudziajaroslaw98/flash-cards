import { DropdownProps } from '#/components/ui/dropdown/dropdown.component';
import type { InputComponentProps } from '#/components/ui/input/input.component';
import type { TextAreaProps } from '#/components/ui/text-area/text-area.component';

export default function isTextArea(
  item:
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | DropdownProps<unknown>,
): item is TextAreaProps {
  return item.type === 'textarea';
}
