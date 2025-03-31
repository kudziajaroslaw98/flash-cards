import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import useTailwindBreakpoint from '#/hooks/use-tailwind-breakpoint';
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

export function Popover({
  trigger,
  position,
  children,
  minWidth = 320,
  nested = false,
  popoverClassName,
}: PropsWithChildren<{
  trigger: ReactNode;
  position: 'top' | 'bottom' | 'bottom-right';
  nested?: boolean;
  popoverClassName?: string;
  minWidth?: number;
}>) {
  const breakpoint = useTailwindBreakpoint();
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

    const minOffset = 48;
    const minGap = 16;
    const minHeight = 320;
    const buttonRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // First set the vertical position
    if (position === 'bottom') {
      // Check available vertical space for bottom position
      popoverRef.current.style.top = `${buttonRect.bottom + 8}px`;
      const availableSpaceY =
        window.innerHeight -
        popoverRef.current.getBoundingClientRect().bottom -
        minGap +
        popoverRef.current.getBoundingClientRect().height -
        minOffset;

      console.log(popoverRef.current.getBoundingClientRect());
      console.log(buttonRect.toJSON());

      if (
        buttonRect.bottom + popoverRef.current.getBoundingClientRect().height >
        window.innerHeight
      ) {
        popoverRef.current.style.bottom = `16px`;
      } else {
        if (
          popoverRef.current.getBoundingClientRect().height > availableSpaceY
        ) {
          popoverRef.current.style.height = `${availableSpaceY > minHeight ? availableSpaceY : minHeight}px`;
          popoverRef.current.style.maxHeight = `${availableSpaceY > minHeight ? availableSpaceY : minHeight}px`;
        }
      }

      const left = buttonRect.left;
      const overflow = window.innerWidth - buttonRect.right;
      const availableSpaceX = left;
      popoverRef.current.style.left = `${availableSpaceX}px`;
    } else if (position === 'bottom-right') {
      const top = buttonRect.bottom + 8;
      popoverRef.current.style.top = `${top}px`;

      // Check available vertical space for bottom position
      const availableSpaceY =
        window.innerHeight -
        popoverRef.current.getBoundingClientRect().bottom -
        minGap +
        popoverRef.current.getBoundingClientRect().height -
        minOffset;

      if (popoverRef.current.getBoundingClientRect().height > availableSpaceY) {
        popoverRef.current.style.height = `${availableSpaceY}px`;
        popoverRef.current.style.maxHeight = `${availableSpaceY}px`;
      }

      const overflow =
        window.innerWidth -
        (window.innerWidth - buttonRect.right + buttonRect.right);

      const availableSpaceX = window.innerWidth - buttonRect.right;

      console.log(overflow, availableSpaceX);
      popoverRef.current.style.right = `${availableSpaceX - overflow}px`;

      if (breakpoint === 'mobile') {
        popoverRef.current.style.right = `${availableSpaceX - overflow}px`;
      } else {
        popoverRef.current.style.right = `${availableSpaceX - overflow}px`;
      }
    } else if (position === 'top') {
      console.log(popoverRef.current.getBoundingClientRect());
      console.log(buttonRect.toJSON());
      const bottom =
        buttonRect.top - popoverRef.current.getBoundingClientRect().height - 8;

      console.log(buttonRect.toJSON());

      popoverRef.current.style.top = `${bottom}px`;
      // Check available vertical space for top position
      const availableSpaceY =
        window.innerHeight -
        popoverRef.current.getBoundingClientRect().top -
        minGap +
        popoverRef.current.getBoundingClientRect().height -
        minOffset;

      if (popoverRef.current.getBoundingClientRect().height > availableSpaceY) {
        popoverRef.current.style.height = `${availableSpaceY}px`;
        popoverRef.current.style.maxHeight = `${availableSpaceY}px`;
      }

      const left = buttonRect.left;
      const overflow =
        window.innerWidth -
        (left +
          popoverRef.current.getBoundingClientRect().width +
          (nested ? 32 : 16));
      const availableSpaceX = left;
      popoverRef.current.style.left = `${availableSpaceX}px`;
    }

    popoverRef.current.style.width = `${nested ? buttonRect.width : buttonRect.width > minHeight ? buttonRect.width : minHeight}px`;
  }, [position, nested, isOpen]);

  useEffect(() => {
    if (isOpen) {
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
