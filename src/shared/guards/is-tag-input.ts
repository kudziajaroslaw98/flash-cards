import type { TagInputComponentProps } from '#/components/_ui/tag-input/tag-input';
import type { InputDefinitions } from '#/types/input-types';

export default function isTagInput(
  item: InputDefinitions,
): item is TagInputComponentProps {
  return item?.type === 'tags';
}
