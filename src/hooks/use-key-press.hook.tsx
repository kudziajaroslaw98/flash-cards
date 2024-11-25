import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const useKeyPress = (
  keys: string[],
  callback: (event: KeyboardEvent) => void,
  node = null,
) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (keys.some((key) => event.key === key)) {
        callbackRef.current(event);
      }
    },
    [keys],
  );

  useEffect(() => {
    const targetNode = node ?? document;
    if (targetNode) {
      targetNode.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      if (targetNode) {
        targetNode.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [handleKeyPress, node]);
};

export default useKeyPress;
