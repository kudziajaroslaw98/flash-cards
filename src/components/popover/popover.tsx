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

export function Popover({
  trigger,
  position,
  children,
  nested = false,
  popoverClassName,
}: PropsWithChildren<{
  trigger: ReactNode;
  position: 'top' | 'bottom';
  nested?: boolean;
  popoverClassName?: string;
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

    const minOffset = 48;
    const minGap = 16;
    const buttonRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // First set the vertical position
    if (position === 'bottom') {
      console.log('button', buttonRect.toJSON(), triggerRef.current);
      console.log('pop', popoverRect.toJSON(), popoverRef.current);

      const top = buttonRect.bottom + 8;
      popoverRef.current.style.top = `${top}px`;

      // Check available vertical space for bottom position
      const availableSpace =
        window.innerHeight -
        popoverRef.current.getBoundingClientRect().bottom -
        minGap +
        popoverRef.current.getBoundingClientRect().height -
        minOffset;

      if (popoverRef.current.getBoundingClientRect().height > availableSpace) {
        popoverRef.current.style.height = `${availableSpace}px`;
        popoverRef.current.style.maxHeight = `${availableSpace}px`;
      }
    } else if (position === 'top') {
      const top =
        buttonRect.y - popoverRef.current.getBoundingClientRect().height - 8;
      popoverRef.current.style.top = `${top}px`;
      // Check available vertical space for top position
      const availableSpace =
        window.innerHeight -
        popoverRef.current.getBoundingClientRect().top -
        minGap +
        popoverRef.current.getBoundingClientRect().height -
        minOffset;

      if (popoverRef.current.getBoundingClientRect().height > availableSpace) {
        popoverRef.current.style.height = `${availableSpace}px`;
        popoverRef.current.style.maxHeight = `${availableSpace}px`;
      }

      // vertical overflow fix
    }

    const left = buttonRect.left;
    const overflow =
      window.innerWidth -
      (left +
        popoverRef.current.getBoundingClientRect().width +
        (nested ? 32 : 16));
    const availableSpace = left - Math.abs(overflow) + 12;
    popoverRef.current.style.left = `${availableSpace}px`;
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
  };

  return (
    <div
      className='contents'
      ref={popoverWrapperRef}
    >
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
