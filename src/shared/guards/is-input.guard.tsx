import { DropdownProps } from '#/components/ui/dropdown/dropdown.component';
import type { InputComponentProps } from '#/components/ui/input/input.component';
import { TextAreaProps } from '#/components/ui/text-area/text-area.component';

export default function isInput(
  item:
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | DropdownProps<unknown>,
): item is InputComponentProps {
  return [
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week',
  ].includes(item.type?.toString() ?? '');
}
