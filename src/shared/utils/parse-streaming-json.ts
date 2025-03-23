export function parseStreamingJSON<T>(streamText: string): {
  completeObjects: T[];
  currentObject: Partial<T> | null;
} {
  // Check if we have the beginning of a JSON array
  if (!streamText.trim().startsWith('[')) {
    return { completeObjects: [], currentObject: null };
  }

  // Split the incoming text by objects
  const objects = [];
  let currentObjectText = '';
  let bracketCount = 0;
  let inObject = false;

  for (let i = 0; i < streamText.length; i++) {
    const char = streamText[i];

    if (char === '{') {
      bracketCount++;
      inObject = true;
    } else if (char === '}') {
      bracketCount--;
    }

    if (inObject) {
      currentObjectText += char;
    }

    // Object is complete
    if (inObject && bracketCount === 0) {
      try {
        // Try to parse the completed object
        const obj = JSON.parse(currentObjectText);
        objects.push(obj);
        currentObjectText = '';
        inObject = false;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Object isn't valid JSON yet, continue
      }
    }
  }

  // Handle the partial object
  let currentObject: Partial<T> | null = null;
  if (inObject && currentObjectText) {
    try {
      // Try to parse the partial object by completing it
      const fixedText = currentObjectText + '}';
      currentObject = JSON.parse(fixedText);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // For more complex partial objects, we need a more sophisticated approach
      currentObject = extractPartialFields<T>(currentObjectText);
    }
  }

  return {
    completeObjects: objects,
    currentObject,
  };
}

// Helper function to extract partial fields from incomplete JSON
function extractPartialFields<T>(partialObjectText: string) {
  const result: Partial<T> = {} as Partial<T>;

  // Use regex to find key-value pairs
  const keyValueRegex = /"([^"]+)":\s*"([^"]*)"/g;
  let match;

  while ((match = keyValueRegex.exec(partialObjectText)) !== null) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, key, value] = match;
    result[key as keyof T] = value as unknown as T[keyof T];
  }

  // Check for the last incomplete field
  const lastKeyRegex = /"([^"]+)":\s*"([^"]*)$/;
  const lastMatch = partialObjectText.match(lastKeyRegex);

  if (lastMatch) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, key, partialValue] = lastMatch;
    result[key as keyof T] = partialValue as unknown as T[keyof T];
  }

  return result;
}
