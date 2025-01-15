export const generateHash = (text?: string): string => {
  if (!text) {
    return Math.random().toString(36);
  }

  // Use text to create a consistent hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};
