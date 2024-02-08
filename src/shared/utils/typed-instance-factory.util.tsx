export default function typedInstanceFactory<T extends object>(
  target: T,
  source: Record<keyof T, T[keyof T]>,
): T {
  return Object.assign(target, source);
}
