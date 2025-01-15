import { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputComponentProps } from '#/components/_ui/input/input';
import { TextAreaProps } from '#/components/_ui/text-area/text-area';

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
