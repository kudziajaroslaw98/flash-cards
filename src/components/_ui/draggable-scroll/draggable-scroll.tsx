import React, { MouseEvent as ReactMouseEvent, ReactNode, useRef } from 'react';

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

  const mouseDownHandler = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    // Save the current scroll position and mouse coordinates
    pos.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
      x: e.clientX,
      y: e.clientY,
    };

    // Add global mouse move and up event listeners
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    // Calculate the distance moved by the mouse
    const dx = e.clientX - pos.current.x;
    const dy = e.clientY - pos.current.y;

    // Update scroll position based on the allowed direction
    if (direction === 'x') {
      scrollRef.current.scrollLeft = pos.current.left - dx;
    } else if (direction === 'y') {
      scrollRef.current.scrollTop = pos.current.top - dy;
    } else if (direction === 'both') {
      scrollRef.current.scrollLeft = pos.current.left - dx;
      scrollRef.current.scrollTop = pos.current.top - dy;
    }
  };

  const mouseUpHandler = () => {
    if (!scrollRef.current) return;
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    scrollRef.current.style.cursor = 'grab';
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={mouseDownHandler}
      className={`${className} cursor-grab select-none`}
      style={{ overflow: 'auto' }}
    >
      {children}
    </div>
  );
};
