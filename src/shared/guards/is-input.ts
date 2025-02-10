import type { InputComponentProps } from '#/components/_ui/input/input';
import type { InputDefinitions } from '#/types/input-types';

export default function isInput(
  item: InputDefinitions,
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
