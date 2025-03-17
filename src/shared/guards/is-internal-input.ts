export function isInternalInput<T>(
  inputName: keyof T | `_internal_${string}`,
): inputName is `_internal_${string}` {
  if (typeof inputName === 'string' && inputName.startsWith('_internal_'))
    return true;
  return false;
}
