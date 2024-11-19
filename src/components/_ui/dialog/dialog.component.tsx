// export type DialogProps = {
//   open?: boolean;
//   onDialogClose: () => void;
//   closeOnBackdropClick?: boolean;
//   isCloseButtonVisible?: boolean;
//   className?: string;
//   currentIndex?: number;
//   maxIndex?: number;
//   isInEditMode?: boolean;
//   multiple?: boolean;
//   handleLeftButtonClick?: () => void;
//   handleRightButtonClick?: () => void;
//   onDialogSubmit?: () => void;
//   submitRef?: React.RefObject<HTMLButtonElement>;
// } & PropsWithChildren

// export const DialogContext = createContext({
//   isCloseButtonVisible: true,
//   onDialogClose: () => {},
// });

// const Dialog = ({
//   children,
//   onDialogClose,
//   onDialogSubmit,
//   handleLeftButtonClick,
//   handleRightButtonClick,
//   submitRef,
//   open = false,
//   closeOnBackdropClick = false,
//   isCloseButtonVisible = true,
//   currentIndex = 0,
//   maxIndex = 0,
//   isInEditMode = false,
//   multiple = false,
// }: DialogProps) => {
//   const ref = useRef<HTMLDivElement>(null);

//   useOutsideAlerter(ref, () => {
//     window.umami.track('Dialog - backdrop clicked');
//     if (onDialogClose && closeOnBackdropClick) {
//       onDialogClose();
//     }
//   });

//   const handleEnter = useCallback(
//     (e: KeyboardEvent) => {
//       window.umami.track('Dialog - enter clicked');

//       const target = e.target as HTMLElement;

//       if (open && target === submitRef?.current && onDialogSubmit) {
//         e.preventDefault();
//         onDialogSubmit();
//       }
//     },
//     [open, submitRef, onDialogSubmit],
//   );

//   const handleArrowRight = useCallback(() => {
//     window.umami.track('Dialog - arrow right clicked');
//     if (open && handleRightButtonClick) {
//       handleRightButtonClick();
//     }
//   }, [open, handleRightButtonClick]);

//   const handleArrowLeft = useCallback(() => {
//     window.umami.track('Dialog - arrow left clicked');
//     if (open && handleLeftButtonClick) {
//       handleLeftButtonClick();
//     }
//   }, [open, handleLeftButtonClick]);

//   const handleEscape = useCallback(() => {
//     window.umami.track('Dialog - escape clicked');

//     if (open && onDialogClose) {
//       onDialogClose();
//     }
//   }, [open, onDialogClose]);

//   useKeyPress(['Escape'], handleEscape);
//   useKeyPress(['Enter'], handleEnter);
//   useKeyPress(['ArrowRight'], handleArrowRight);
//   useKeyPress(['ArrowLeft'], handleArrowLeft);

//   const buttonLeft = (
//     <Button
//       size='icon'
//       variant={currentIndex === 0 ? 'disabled-fill' : 'primary'}
//       disabled={currentIndex === 0}
//       icon={<ArrowLeftIcon className='h-4 w-4' />}
//       onClick={handleLeftButtonClick}
//     />
//   );

//   const buttonRight = (
//     <Button
//       size='icon'
//       variant={
//         currentIndex >= maxIndex - 1 && isInEditMode
//           ? 'disabled-fill'
//           : 'primary'
//       }
//       disabled={currentIndex >= maxIndex - 1 && isInEditMode}
//       icon={
//         currentIndex === maxIndex - 1 && !isInEditMode ? (
//           <PlusIcon className='h-4 w-4' />
//         ) : (
//           <ArrowRightIcon className='h-4 w-4' />
//         )
//       }
//       onClick={handleRightButtonClick}
//     />
//   );

//   return (
{
  /* <>
  {open &&
    createPortal(
      <DialogContext.Provider value={{ isCloseButtonVisible, onDialogClose }}>
        <div className='fixed right-0 top-0 z-[100] h-screen w-screen bg-black/75 backdrop-blur-sm'>
          <div
            className='flex h-full w-full  items-center justify-center gap-4'
            ref={ref}
          >
            <span className='hidden md:flex'>{multiple && buttonLeft}</span>

            <div className='flex w-full max-w-96 flex-col items-center justify-center gap-4'>
              <m.div
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, translateY: -100 }}
                key={currentIndex + '1'}
                className='w-full'
              >
                {children}
              </m.div>

              <div className='flex w-full items-center gap-4 md:hidden'>
                {buttonLeft}

                {buttonRight}
              </div>

              <div className='text-sm text-gray-200'>
                {multiple && `${currentIndex + 1} | ${maxIndex}`}
              </div>
            </div>

            <span className='hidden md:flex'>{multiple && buttonRight}</span>
          </div>
        </div>
      </DialogContext.Provider>,
      document.body,
    )}
</>; */
}
//   );
// };

// Dialog.displayName = 'Dialog';

// export default Dialog;
