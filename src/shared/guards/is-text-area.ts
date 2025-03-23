import type { TextAreaProps } from '#/components/_ui/text-area/text-area';
import type { InputDefinitions } from '#/types/input-types';

export default function isTextArea<T>(
  item: InputDefinitions<T>,
): item is TextAreaProps {
  return item.type === 'textarea';
}
