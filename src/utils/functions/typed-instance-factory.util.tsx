export default function typedInstanceFactory<T extends {}>(target: T, source: Record<keyof T, T[keyof T]>): T {
  return Object.assign(target, source);
}
