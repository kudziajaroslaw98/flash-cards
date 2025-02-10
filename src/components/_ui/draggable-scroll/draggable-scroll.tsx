import React, {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

import * as m from 'motion/react-m';

interface DraggableScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'x' | 'y' | 'both';
}

export const DraggableScroll: React.FC<DraggableScrollProps> = ({
  children,
  className = '',
  direction = 'y',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ left: 0, top: 0, x: 0, y: 0 });
  const isDragging = useRef(false);

  // Add passive wheel listener for native scrolling
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) element!.scrollLeft += 40;
      else element!.scrollLeft -= 40;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const mouseDownHandler = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;

    isDragging.current = true;
    pos.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;

    const dx = e.clientX - pos.current.x;
    const dy = e.clientY - pos.current.y;

    if (direction === 'x' || direction === 'both') {
      scrollRef.current.scrollLeft = pos.current.left - dx;
    }
    if (direction === 'y' || direction === 'both') {
      scrollRef.current.scrollTop = pos.current.top - dy;
    }
  };

  const mouseUpHandler = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  return (
    <m.div
      ref={scrollRef}
      onMouseDown={mouseDownHandler}
      className={`${className} cursor-grab select-none`}
      style={{
        overflow: 'auto',
        cursor: 'grab',
      }}
    >
      {children}
    </m.div>
  );
};
