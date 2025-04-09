import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import * as m from 'motion/react-m';
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface PositionConfig {
  minOffset: number;
  minGap: number;
  minHeight: number;
  popoverMargin: number;
}

interface WindowDimensions {
  width: number;
  height: number;
}

export function Popover({
  trigger,
  position,
  children,
  nested = false,
  popoverClassName,
}: PropsWithChildren<{
  trigger: ReactNode;
  position: 'top' | 'bottom' | 'bottom-right';
  nested?: boolean;
  popoverClassName?: string;
  minWidth?: number;
}>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverItemsEndRef = useRef<HTMLDivElement>(null);
  const popoverWrapperRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(popoverWrapperRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const updatePopoverPosition = useCallback(() => {
    if (!popoverRef.current || !triggerRef.current || !isOpen) return;

    const config = {
      minOffset: 48,
      minGap: 16,
      minHeight: 320,
      popoverMargin: 8,
    };

    const buttonRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const windowDimensions: WindowDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Reset any previously set dimensions
    popoverRef.current.style.width = `${nested ? buttonRect.width : Math.max(buttonRect.width, config.minHeight)}px`;

    // Position based on selected placement strategy
    switch (position) {
      case 'bottom':
        positionBottom(buttonRect, popoverRect, windowDimensions, config);
        break;
      case 'bottom-right':
        positionBottomRight(buttonRect, popoverRect, windowDimensions, config);
        break;
      case 'top':
        positionTop(buttonRect, popoverRect, windowDimensions, config);
        break;
    }

    function positionBottom(
      buttonRect: DOMRect,
      popoverRect: DOMRect,
      windowDimensions: WindowDimensions,
      config: PositionConfig,
    ): void {
      // Vertical positioning
      popoverRef.current!.style.top = `${buttonRect.bottom + config.popoverMargin}px`;

      // Check if popover extends beyond bottom of viewport
      if (buttonRect.bottom + popoverRect.height > windowDimensions.height) {
        popoverRef.current!.style.bottom = `${config.minGap}px`;
      } else {
        // Adjust height if not enough space
        const availableSpaceY =
          windowDimensions.height -
          (buttonRect.bottom + config.popoverMargin) -
          config.minGap;

        if (popoverRect.height > availableSpaceY) {
          const adjustedHeight = Math.max(availableSpaceY, config.minHeight);
          popoverRef.current!.style.height = `${adjustedHeight}px`;
          popoverRef.current!.style.maxHeight = `${adjustedHeight}px`;
        }
      }

      // Horizontal positioning
      popoverRef.current!.style.left = `${buttonRect.left}px`;
    }

    function positionBottomRight(
      buttonRect: DOMRect,
      popoverRect: DOMRect,
      windowDimensions: WindowDimensions,
      config: PositionConfig,
    ): void {
      // Vertical positioning
      popoverRef.current!.style.top = `${buttonRect.bottom + config.popoverMargin}px`;

      // Adjust height if not enough space
      const availableSpaceY =
        windowDimensions.height -
        (buttonRect.bottom + config.popoverMargin) -
        config.minGap;

      if (popoverRect.height > availableSpaceY) {
        popoverRef.current!.style.height = `${availableSpaceY}px`;
        popoverRef.current!.style.maxHeight = `${availableSpaceY}px`;
      }

      // Horizontal positioning - align to right
      const rightOffset = windowDimensions.width - buttonRect.right;
      popoverRef.current!.style.right = `${rightOffset}px`;

      // Remove any left positioning that might have been set
      popoverRef.current!.style.left = '';
    }

    function positionTop(
      buttonRect: DOMRect,
      popoverRect: DOMRect,
      windowDimensions: WindowDimensions,
      config: PositionConfig,
    ): void {
      // Vertical positioning
      const topPosition =
        buttonRect.top - popoverRect.height - config.popoverMargin;
      popoverRef.current!.style.top = `${topPosition}px`;

      // Adjust height if not enough space
      const availableSpaceY =
        buttonRect.top - config.popoverMargin - config.minGap;

      if (popoverRect.height > availableSpaceY) {
        popoverRef.current!.style.height = `${availableSpaceY}px`;
        popoverRef.current!.style.maxHeight = `${availableSpaceY}px`;
      }

      // Horizontal positioning
      popoverRef.current!.style.left = `${buttonRect.left}px`;

      // Remove any right positioning that might have been set
      popoverRef.current!.style.right = '';
    }
  }, [position, nested, isOpen]);

  useEffect(() => {
    if (!isOpen || !window) return;
    // Debounce or throttle updatePopoverPosition if performance becomes an issue

    // eslint-disable-next-line no-undef
    let debounceTimeout: NodeJS.Timeout | null = null;
    const debouncedUpdatePosition = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        requestAnimationFrame(updatePopoverPosition);
      }, 50); // Adjust debounce delay as needed
    };

    window.addEventListener('scroll', debouncedUpdatePosition, {
      passive: true,
      capture: true,
    }); // Use capture phase for scroll
    window.addEventListener('resize', debouncedUpdatePosition);
    debouncedUpdatePosition(); // Initial position update

    return () => {
      // Make sure to remove the same function reference
      if (debounceTimeout) clearTimeout(debounceTimeout);
      window.removeEventListener('scroll', debouncedUpdatePosition, {
        capture: true,
      });
      window.removeEventListener('resize', debouncedUpdatePosition);
    };
  }, [isOpen, updatePopoverPosition]);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    // Debounce the update function to avoid excessive recalculations during rapid mutations
    // eslint-disable-next-line no-undef
    let debounceTimeout: NodeJS.Timeout | null = null;
    const debouncedUpdatePosition = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        requestAnimationFrame(updatePopoverPosition);
      }, 50); // Adjust debounce delay as needed
    };

    const observer = new MutationObserver(() => {
      // Check if the trigger element's position actually changed significantly
      // This check is optional but can prevent unnecessary updates
      // For simplicity, we'll just call the debounced update directly
      debouncedUpdatePosition();
    });

    // Observe the body for subtree modifications (additions/removals)
    // Consider observing a closer ancestor if possible for better performance
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [isOpen, updatePopoverPosition]);

  const handleTogglePopover = () => {
    setIsOpen((prev) => !prev);
    console.log(position);
  };

  return (
    <div ref={popoverWrapperRef}>
      <div
        onClick={handleTogglePopover}
        ref={triggerRef}
        className='h-auto w-auto'
      >
        {trigger}
      </div>

      {isOpen && (
        <m.div
          ref={popoverRef}
          data-open={isOpen}
          className={cn([
            'fixed',
            'flex flex-col overflow-visible rounded-md border bg-gray-50 dark:border-slate-900 dark:bg-slate-950',
            'border border-gray-300 shadow-xl dark:border-slate-900 dark:shadow-black',
            'z-30',
            popoverClassName,
          ])}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {children}
          <div ref={popoverItemsEndRef} />
        </m.div>
      )}
    </div>
  );
}
