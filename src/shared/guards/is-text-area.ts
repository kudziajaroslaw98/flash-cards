import type { TextAreaProps } from '#/components/_ui/text-area/text-area';
import type { InputDefinitions } from '#/types/input-types';

export default function isTextArea(
  item: InputDefinitions,
): item is TextAreaProps {
  return item.type === 'textarea';
}
