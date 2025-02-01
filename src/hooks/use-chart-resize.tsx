import { useEffect } from 'react';

export const useChartResize = (
  ref: React.RefObject<SVGSVGElement | null>,
  callback: () => void,
) => {
  useEffect(() => {
    const observer = new ResizeObserver(callback);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [callback, ref]);
};
