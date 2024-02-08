export default function convertEnumToReadableString(item: string) {
  return item.toLowerCase().replaceAll('_', ' ');
}
