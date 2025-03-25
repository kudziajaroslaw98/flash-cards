import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook to track window resize events safely
 * @param callback Function to call when window is resized
 * @param options Configuration options for resize tracking
 */
export const useResizeObserver = (
  callback: (dimensions: { width: number; height: number }) => void,
  element: HTMLElement | null,
  options: {
    debounceDelay?: number;
    throttle?: boolean;
  } = {},
) => {
  const { debounceDelay = 200, throttle = false } = options;

  // Safe initial state with default dimensions
  const [dimensions, setDimensions] = useState({
    width: element !== null ? element.getBoundingClientRect().width : 0,
    height: element !== null ? element.getBoundingClientRect().height : 0,
  });

  // Memoized resize handler
  const handleResize = useCallback(() => {
    console.log('resize');
    // Only run on client-side
    if (element === null) {
      return;
    }

    const newDimensions = {
      width: element.getBoundingClientRect().width,
      height: element.getBoundingClientRect().height,
    };

    // Only update if dimensions changed
    if (
      newDimensions.width !== dimensions.width ||
      newDimensions.height !== dimensions.height
    ) {
      setDimensions(newDimensions);
      callback(newDimensions);
    }
  }, [callback, dimensions]);

  useEffect(() => {
    // Ensure we're on the client-side
    if (element === null) return;

    // Choose between debounce and throttle
    // eslint-disable-next-line no-undef
    let timeoutId: NodeJS.Timeout;
    let rafId: number;

    const resizeHandler = throttle
      ? () => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(handleResize);
        }
      : () => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(handleResize, debounceDelay);
        };

    // Add resize listener
    element.addEventListener('resize', resizeHandler);

    // Trigger initial callback
    handleResize();

    // Cleanup
    return () => {
      element.removeEventListener('resize', resizeHandler);
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleResize, debounceDelay, throttle]);

  return { dimensions, handleResize };
};
