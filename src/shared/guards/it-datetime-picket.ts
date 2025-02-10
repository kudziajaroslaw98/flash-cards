import type { DateTimePickerProps } from '#/components/_ui/date-picker/date-picker';
import type { InputDefinitions } from '#/types/input-types';

export default function isDateTimePicker(
  item: InputDefinitions,
): item is DateTimePickerProps {
  return item?.type === 'datetime-picker';
}
