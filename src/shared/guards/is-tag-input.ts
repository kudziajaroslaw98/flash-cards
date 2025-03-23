import type { TagInputComponentProps } from '#/components/_ui/tag-input/tag-input';
import type { InputDefinitions } from '#/types/input-types';

export default function isTagInput<T>(
  item: InputDefinitions<T>,
): item is TagInputComponentProps {
  return item?.type === 'tags';
}
