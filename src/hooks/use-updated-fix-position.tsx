import { useCallback, useEffect } from 'react';

interface HookProps {
  visible: boolean;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}

export function useUpdatedFixPosition({
  visible,
  wrapperRef,
  popoverRef,
}: HookProps) {
  const updatePopoverPosition = useCallback(() => {
    if (!wrapperRef.current || !popoverRef.current) return;

    const buttonRect = wrapperRef.current.getBoundingClientRect();
    const top =
      (((wrapperRef.current.getBoundingClientRect().y as number) +
        wrapperRef.current.getBoundingClientRect().height) as number) + 8;

    popoverRef.current.style.top = `${top}px`;
    popoverRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
    popoverRef.current.style.width = `${wrapperRef.current.getBoundingClientRect().width}px`;
  }, []);

  useEffect(() => {
    if (visible) {
      updatePopoverPosition();
      window.addEventListener('scroll', updatePopoverPosition, {
        passive: true,
      });
      window.addEventListener('resize', updatePopoverPosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePopoverPosition);
      window.removeEventListener('resize', updatePopoverPosition);
    };
  }, [visible, updatePopoverPosition]);
}
