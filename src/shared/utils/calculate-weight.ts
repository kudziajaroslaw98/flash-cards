export function calculateWeight(dueDate: Date | string): number {
  const now = Date.now();
  const diff = new Date(dueDate).getTime() - now;
  return Math.max(0, Math.floor(diff / 1000 / 60)); // Weight in minutes
}

export function calculateReversedWeight(weight: number, max: number): number {
  let reversedWeight = max - weight;
  return (reversedWeight = reversedWeight < 600 ? 600 : reversedWeight);
}
