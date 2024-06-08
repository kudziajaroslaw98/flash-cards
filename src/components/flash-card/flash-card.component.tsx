import { FlashCardTypesEnum } from '#/shared/enums/flash-card-types.enum';
import { FlashCard } from '#/shared/models/flash-card.model';
import type React from 'react';
import { useCallback } from 'react';
import Card from '../ui/card/card.component';

interface FlashCardProps {
  flashCard: FlashCard;
  reviseType: FlashCardTypesEnum;
  onClick?: (_value: FlashCard) => void;
  correct?: boolean;
  clickedOnFlashCard?: boolean;
  clickedOverall?: boolean;
}

export default function FlashCardComponent(props: Readonly<FlashCardProps>) {
  const getClickedCardStyles = useCallback(() => {
    if (
      props?.correct &&
      props?.clickedOnFlashCard &&
      props?.reviseType !== FlashCardTypesEnum.SHOW_ALL
    ) {
      return 'ring ring-green-400/60';
    } else if (
      !props?.correct &&
      props.clickedOnFlashCard &&
      props?.reviseType !== FlashCardTypesEnum.SHOW_ALL
    ) {
      return 'ring ring-red-400/60';
    } else if (
      props?.correct &&
      props.clickedOverall &&
      !props?.clickedOnFlashCard &&
      props?.reviseType !== FlashCardTypesEnum.SHOW_ALL
    ) {
      return 'animate-shake ring ring-green-400/20';
    } else {
      return '';
    }
  }, [props]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        props?.onClick?.(props.flashCard);
        break;
      default:
        break;
    }
  };

  const handleCardClick = () => {
    if (props?.onClick) {
      props.onClick(props.flashCard);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`z-10 h-full w-full flex-col ${getClickedCardStyles()}`}
    >
      <h5
        className={`z-20 flex w-full items-center rounded-md sm:min-h-10 sm:items-start ${
          props.reviseType === FlashCardTypesEnum.GUESS_DEFINITION
            ? 'bg-gray-200 dark:bg-slate-800'
            : 'bg-transparent'
        }`}
      >
        {props.reviseType === FlashCardTypesEnum.GUESS_DEFINITION
          ? ''
          : props.flashCard?.word}
      </h5>

      <p
        className={`z-20 flex w-full items-center rounded-md text-sm sm:min-h-16 sm:items-start ${
          props.reviseType === FlashCardTypesEnum.GUESS_NAME
            ? 'bg-gray-200 dark:bg-slate-800'
            : 'bg-transparent'
        }`}
      >
        {props.reviseType === FlashCardTypesEnum.GUESS_NAME
          ? ''
          : props.flashCard?.definition}
      </p>
    </Card>
  );
}
