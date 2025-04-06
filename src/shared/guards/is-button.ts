import type { InputDefinitions, InternalButton } from '#/types/input-types';

export default function isButton<T>(
  item: InputDefinitions<T>,
): item is InternalButton {
  return item.type === '_internal_button';
}
