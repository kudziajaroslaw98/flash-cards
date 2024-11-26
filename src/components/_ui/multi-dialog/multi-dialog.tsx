import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { useCallback, useMemo, useRef, type PropsWithChildren } from 'react';
import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import DialogProvider from '#/providers/dialog.providers';
import { Trigger } from '#/components/_shared/trigger';
import useKeyPress from '#/hooks/use-key-press.hook';
import { Button } from '../button/button';
import { createPortal } from 'react-dom';
import * as m from 'framer-motion/m';

export type MultiDialogProps = {
  open: boolean;
  trigger: React.ReactNode;
  isCloseButtonVisible?: boolean;
  closeOnBackdropClick?: boolean;
  currentIndex: number;
  maxIndex: number;
  isInEditMode?: boolean;
  submitRef?: React.RefObject<HTMLButtonElement>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDialogClose: () => void;
  onDialogSubmit?: () => void;
  handleLeftButtonClick?: () => void;
  handleRightButtonClick?: () => void;
} & PropsWithChildren;

export type MultiDialogContextType = {
  isCloseButtonVisible: boolean;
  onDialogClose: () => void;
  currentIndex: number;
  maxIndex: number;
  isInEditMode?: boolean;
};

export const MultiDialog = ({
  open,
  submitRef,
  setOpen,
  onDialogClose,
  onDialogSubmit,
  currentIndex = 0,
  maxIndex = 0,
  isInEditMode = false,
  handleLeftButtonClick,
  handleRightButtonClick,
  isCloseButtonVisible = true,
  closeOnBackdropClick = false,
  ...props
}: MultiDialogProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideAlerter(ref, () => {
    window.umami.track('Dialog - backdrop clicked');
    if (onDialogClose && closeOnBackdropClick) {
      onDialogClose();
    }
  });

  const handleEnter = useCallback(
    (e: KeyboardEvent) => {
      window.umami.track('Dialog - enter clicked');

      const target = e.target as HTMLElement;

      if (open && target === submitRef?.current && onDialogSubmit) {
        e.preventDefault();
        onDialogSubmit();
      }
    },
    [open, submitRef, onDialogSubmit],
  );

  const handleArrowRight = useCallback(() => {
    window.umami.track('Dialog - arrow right clicked');
    if (open && handleRightButtonClick) {
      handleRightButtonClick();
    }
  }, [open, handleRightButtonClick]);

  const handleArrowLeft = useCallback(() => {
    window.umami.track('Dialog - arrow left clicked');
    if (open && handleLeftButtonClick) {
      handleLeftButtonClick();
    }
  }, [open, handleLeftButtonClick]);

  const handleEscape = useCallback(() => {
    window.umami.track('Dialog - escape clicked');

    if (open && onDialogClose) {
      onDialogClose();
    }
  }, [open, onDialogClose]);

  useKeyPress(['Escape'], handleEscape);
  useKeyPress(['Enter'], handleEnter);
  useKeyPress(['ArrowRight'], handleArrowRight);
  useKeyPress(['ArrowLeft'], handleArrowLeft);

  const canMoveRight = useMemo(
    () => currentIndex >= maxIndex - 1,
    [currentIndex, maxIndex],
  );
  const reachedEnd = useMemo(
    () => currentIndex === maxIndex - 1,
    [currentIndex, maxIndex],
  );

  const buttonLeft = (
    <Button
      size='icon'
      variant={currentIndex === 0 ? 'disabled-fill' : 'primary'}
      disabled={currentIndex === 0}
      icon={<ArrowLeftIcon className='h-4 w-4' />}
      onClick={handleLeftButtonClick}
    />
  );

  const buttonRight = (
    <Button
      size='icon'
      variant={canMoveRight && isInEditMode ? 'disabled-fill' : 'primary'}
      disabled={canMoveRight && isInEditMode}
      icon={
        reachedEnd && !isInEditMode ? (
          <PlusIcon className='h-4 w-4' />
        ) : (
          <ArrowRightIcon className='h-4 w-4' />
        )
      }
      onClick={handleRightButtonClick}
    />
  );

  const toggleDialog = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      <Trigger trigger={toggleDialog}>{props.trigger}</Trigger>

      {open &&
        createPortal(
          <DialogProvider
            isCloseButtonVisible={isCloseButtonVisible}
            onDialogClose={onDialogClose}
          >
            <div className='fixed right-0 top-0 z-[100] h-screen w-screen bg-black/75 backdrop-blur-sm'>
              <div
                className='flex h-full w-full  items-center justify-center gap-4'
                ref={ref}
              >
                <span className='hidden md:flex'>{buttonLeft}</span>

                <div className='flex w-full max-w-96 flex-col items-center justify-center gap-4'>
                  <m.div
                    transition={{ duration: 0.3 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, translateY: -100 }}
                    key={currentIndex + '1'}
                    className='w-full'
                  >
                    {props.children}
                  </m.div>

                  <div className='flex w-full items-center gap-4 md:hidden'>
                    {buttonLeft}

                    {buttonRight}
                  </div>

                  <div className='text-sm text-gray-200'>
                    {`${currentIndex + 1} | ${maxIndex}`}
                  </div>
                </div>

                <span className='hidden md:flex'>{buttonRight}</span>
              </div>
            </div>
          </DialogProvider>,
          document.body,
        )}
    </>
  );
};
