export function extractObjectsFromString<T = unknown>(str: string): T[] | null {
  const objects = [];
  const stack = [];
  let startIndex = -1;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (stack.length === 0) startIndex = i;
      stack.push(i);
    } else if (str[i] === '}') {
      stack.pop();
      if (stack.length === 0 && startIndex !== -1) {
        objects.push(str.slice(startIndex, i + 1));
        startIndex = -1;
      }
    }
  }

  return objects?.map((match) => {
    return JSON.parse(match);
  });
}
