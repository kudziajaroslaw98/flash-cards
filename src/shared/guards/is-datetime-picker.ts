import type { DateTimePickerProps } from '#/components/_ui/date-picker/date-picker';
import type { InputDefinitions } from '#/types/input-types';

export default function isDateTimePicker<T>(
  item: InputDefinitions<T>,
): item is DateTimePickerProps {
  return item?.type === 'datetime-picker';
}
