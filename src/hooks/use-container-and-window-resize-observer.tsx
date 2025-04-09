import { RefObject, useCallback, useEffect, useRef } from 'react';

// Define the structure of the data passed to the callback
interface ResizeData {
  windowWidth: number;
  containerWidth: number | null; // Container might not be rendered yet
}

// Type for the callback function
type ResizeCallback = (data: ResizeData) => void;

// Optional options for the hook
interface UseResizeObserverOptions {
  debounceDelay?: number; // Debounce delay in milliseconds
  box?: 'border-box' | 'content-box' | 'device-pixel-content-box'; // ResizeObserver box option
}

/**
 * Custom hook to observe window and container resize events with debouncing.
 *
 * @param callback Function to call when a resize occurs after debouncing.
 * @param options Optional configuration: debounceDelay (ms) and ResizeObserver box option.
 * @returns A RefObject to attach to the container element.
 */
function useContainerAndWindowResizeObserver<
  T extends HTMLElement = HTMLDivElement,
>(
  callback: ResizeCallback,
  options: UseResizeObserverOptions = {},
): RefObject<T | null> {
  const { debounceDelay = 100, box = 'border-box' } = options;

  const containerRef = useRef<T>(null);
  const callbackRef = useRef(callback);
  // eslint-disable-next-line no-undef
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedWidths = useRef<ResizeData>({
    windowWidth: 0, // Initialize with 0 or initial values
    containerWidth: null,
  });
  const initialCheckDone = useRef(false); // Track if initial check ran

  // Keep the callback ref updated without causing effect re-runs
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // The core function that checks dimensions and calls the callback if changed
  const checkDimensionsAndCallback = useCallback(() => {
    // Ensure this only runs client-side
    if (typeof window === 'undefined') {
      return;
    }

    const currentWindowWidth = window.innerWidth;
    let currentContainerWidth: number | null = null;

    if (containerRef.current) {
      // Use getBoundingClientRect().width for potentially more precision (includes fractions)
      // and aligns well with different box-sizing models. offsetWidth is integer-based.
      currentContainerWidth =
        containerRef.current.getBoundingClientRect().width;
    }

    const windowChanged =
      currentWindowWidth !== lastReportedWidths.current.windowWidth;
    const containerChanged =
      currentContainerWidth !== lastReportedWidths.current.containerWidth;

    // Trigger if it's the very first check OR if any width actually changed
    if (!initialCheckDone.current || windowChanged || containerChanged) {
      const newData: ResizeData = {
        windowWidth: currentWindowWidth,
        containerWidth: currentContainerWidth,
      };

      // Update last reported widths *before* calling callback
      lastReportedWidths.current = newData;
      initialCheckDone.current = true; // Mark initial check as done

      // Call the user's callback
      callbackRef.current(newData);
    }
  }, []); // No dependencies, relies on refs

  // Debounced version of the check function
  const debouncedCheck = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(
      checkDimensionsAndCallback,
      debounceDelay,
    );
  }, [debounceDelay, checkDimensionsAndCallback]);

  useEffect(() => {
    // Ensure this only runs client-side
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    const observedElement = containerRef.current;

    // --- Setup Window Listener ---
    window.addEventListener('resize', debouncedCheck, { passive: true });

    // --- Setup Resize Observer ---
    // The ResizeObserver callback itself can be debounced
    const observer = new ResizeObserver(debouncedCheck);
    observer.observe(observedElement, { box });

    // --- Initial Check ---
    // Perform an initial check shortly after mount without debounce
    // Use requestAnimationFrame to ensure layout is stable
    const rafId = requestAnimationFrame(checkDimensionsAndCallback);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      observer.disconnect();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      cancelAnimationFrame(rafId);
      // Reset initial check flag if component unmounts/remounts
      initialCheckDone.current = false;
    };
    // Rerun effect if debounceDelay or box option changes.
    // checkDimensionsAndCallback is stable due to useCallback([]) and refs.
    // debouncedCheck depends on debounceDelay and checkDimensionsAndCallback.
  }, [debouncedCheck, checkDimensionsAndCallback, box]); // Include 'box' in dependencies

  return containerRef;
}

export default useContainerAndWindowResizeObserver;
