// import { useCallback, useEffect, useRef, useState } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';

// /**
//  * Custom hook to track window resize events safely
//  * @param callback Function to call when window is resized
//  * @param options Configuration options for resize tracking
//  */
// export const useResizeObserver = (
//   callback: (width: number) => void,
//   options: {
//     debounceDelay?: number;
//     throttle?: boolean;
//   } = {},
// ) => {
//   const { debounceDelay = 200 } = options;

//   // Ref to store the observed element
//   const elementRef = useRef<HTMLDivElement | null>(null);

//   // Ref to store the ResizeObserver
//   const observerRef = useRef<ResizeObserver | null>(null);

//   // State to track current width
//   const [width, setWidth] = useState(0);

//   // Memoized resize handler with debounce
//   const handleResize = useCallback(() => {
//     if (elementRef.current) {
//       const newWidth = elementRef.current.offsetWidth;

//       // Only trigger callback if width actually changes
//       if (newWidth !== width) {
//         setWidth(newWidth);
//         callback(newWidth);
//       }
//     }
//   }, [callback, width]);

//   // Debounce wrapper
//   const debouncedResize = useCallback(() => {
//     // eslint-disable-next-line no-undef
//     let timeoutId: NodeJS.Timeout;
//     return () => {
//       if (timeoutId) clearTimeout(timeoutId);
//       timeoutId = setTimeout(handleResize, debounceDelay);
//     };
//   }, [handleResize, debounceDelay])();

//   useEffect(() => {
//     // Ensure ResizeObserver is supported
//     if (typeof ResizeObserver === 'undefined') {
//       console.warn('ResizeObserver is not supported in this browser');
//       return;
//     }

//     // Create ResizeObserver
//     observerRef.current = new ResizeObserver(debouncedResize);

//     return () => {
//       // Disconnect observer on cleanup
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [debouncedResize]);

//   // Ref callback to attach observer
//   const ref = useCallback((element: HTMLDivElement | null) => {
//     // Disconnect previous observer if exists
//     if (observerRef.current && elementRef.current) {
//       observerRef.current.unobserve(elementRef.current);
//     }

//     // Update element ref
//     elementRef.current = element;

//     // Observe new element
//     if (element && observerRef.current) {
//       observerRef.current.observe(element);
//     }
//   }, []);

//   return { ref, elementRef, width };
// };

function useResizeObserver(
  callback: (size: { width: number; height: number }) => void,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  const observer = useRef<ResizeObserver | null>(null);
  const onResizeCallback = useCallback(callback, [callback]); // Memoize onResize callback
  const [oldWidth, setOldWidth] = useState(0);

  const handleResize = useCallback(() => {
    if (ref.current) {
      const newWidth = ref.current.getBoundingClientRect().width;

      // Only trigger callback if width actually changes
      if (newWidth !== oldWidth) {
        setOldWidth(newWidth);
        callback({
          width: newWidth,
          height: ref.current.getBoundingClientRect().height,
        });
      }
    }
  }, [callback, oldWidth]);
  
  const debouncedResize = useCallback(() => {
      // eslint-disable-next-line no-undef
      let timeoutId: NodeJS.Timeout;
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(handleResize, 200);
      };
    }, [handleResize])();

  useEffect(() => {
    if (ref?.current === undefined || ref.current === null) {
      return; // Do nothing if ref is not yet attached to an element
    }

    observer.current = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }

      const entry = entries[0]; // We are observing a single element, so take the first entry
      const { width, height } = entry.contentRect;

      if (onResizeCallback && width !== oldWidth) {
        setOldWidth(width);
        onResizeCallback({ width, height });
      }
    });

    observer.current.observe(ref.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect(); // Cleanup observer on unmount or ref change
      }
    };
  }, [ref, onResizeCallback]); // Re-run effect if ref or onResize callback changes

  return null; // This hook doesn't need to return anything visible
}

export default useResizeObserver;
