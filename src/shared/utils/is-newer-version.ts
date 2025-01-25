export default function isNewerVersion(
  reference: string,
  compared: string,
): boolean {
  const referenceParts = reference.split('.').map((part) => parseInt(part, 10));
  const comparedParts = compared.split('.').map((part) => parseInt(part, 10));

  return comparedParts.some((part, index) => part > referenceParts[index]);
}
