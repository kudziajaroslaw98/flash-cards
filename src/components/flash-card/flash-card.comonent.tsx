import { FlashCardTypesEnum } from '#/utils/enums/flash-card-types.enum';
import { FlashCardModel } from '#/utils/models/flash-card.model';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

interface FlashCardParams {
  flashCard: FlashCardModel;
  reviseType: FlashCardTypesEnum;
  onClick: (value: FlashCardModel) => void;
  correct?: boolean;
  clickedOnFlashCard?: boolean;
  clickedOverall?: boolean;
}

export default function FlashCardComponent(params: Readonly<FlashCardParams>) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const handleMouseMove = (
    clientX: number,
    clientY: number,
    currentTarget: EventTarget & HTMLElement,
  ) => {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const getClickedCardStyles = () => {
    if (
      params?.correct &&
      params?.clickedOnFlashCard &&
      params?.reviseType !== FlashCardTypesEnum.SHOW_ALL
    ) {
      return 'ring ring-green-400/60 shadow-card-hovered md:hover:translate-y-1';
    } else if (
      !params?.correct &&
      params.clickedOnFlashCard &&
      params?.reviseType !== FlashCardTypesEnum.SHOW_ALL
    ) {
      return 'ring ring-red-400/60 shadow-card-hovered md:hover:translate-y-1';
    } else if (
      params?.correct &&
      params.clickedOverall &&
      !params?.clickedOnFlashCard &&
      params?.reviseType !== FlashCardTypesEnum.SHOW_ALL
    ) {
      return 'animate-shake shadow-card-hovered translate-y-1';
    } else {
      return 'md:hover:translate-y-1 shadow-card md:hover:shadow-card-hovered';
    }
  };

  return (
    <div
      onClick={() => params.onClick(params.flashCard)}
      onMouseMove={(e) =>
        handleMouseMove(e.clientX, e.clientY, e.currentTarget)
      }
      className={`group relative z-10 flex h-full min-h-32 w-full max-w-80 cursor-pointer flex-col justify-center gap-2 rounded-md border border-gray-50 bg-gray-100 p-4 transition-all active:scale-95 sm:justify-start sm:gap-3  dark:border-slate-800 dark:bg-slate-900 ${getClickedCardStyles()}`}
    >
      <motion.div
        className='pointer-events-none absolute inset-0 z-10 flex opacity-0 transition-all group-hover:opacity-100 dark:hidden'
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgb(226 226 226 / .6), transparent 60%)`,
        }}
      />

      <motion.div
        className='pointer-events-none absolute inset-0 z-10 hidden opacity-0 transition-all group-hover:opacity-100 dark:flex'
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgb(10 15 27 / .6), transparent 60%)`,
        }}
      />

      <h2
        className={`text z-20 flex w-full items-center rounded-md text-xl text-gray-800 sm:min-h-10 sm:items-start sm:font-semibold dark:text-slate-300 ${
          params.reviseType === FlashCardTypesEnum.GUESS_DEFINITION
            ? 'bg-green-200 dark:bg-slate-600'
            : 'bg-transparent'
        }`}
      >
        {params.reviseType === FlashCardTypesEnum.GUESS_DEFINITION
          ? ''
          : params.flashCard?.word}
      </h2>

      <h4
        className={`z-20 flex w-full min-w-72 items-center rounded-md text-sm font-normal text-gray-600 sm:min-h-16 sm:items-start dark:text-slate-300 ${
          params.reviseType === FlashCardTypesEnum.GUESS_NAME
            ? 'bg-green-200 dark:bg-slate-600'
            : 'bg-transparent'
        }`}
      >
        {params.reviseType === FlashCardTypesEnum.GUESS_NAME
          ? ''
          : params.flashCard?.definition}
      </h4>
    </div>
  );
}
