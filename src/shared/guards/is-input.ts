import type { InputDefinitions, VanillaInputType } from '#/types/input-types';

export default function isInput<T>(
  item: InputDefinitions<T>,
): item is VanillaInputType {
  return (
    item.type === 'input' &&
    [
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
    ].includes(item.inputType?.toString() ?? '')
  );
}
