import useLongPress from '#/hooks/use-long-press.hook';
import { FlashCard } from '#/shared/models/flash-card.model';
import { cn } from '#/shared/utils/cn.util';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Card from '../ui/card/card.component';

interface FlashCardProps {
  flashCard: FlashCard;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  onSelect?: (flashCard: FlashCard) => void;
}

export default function FlashCardComponent({
  isSelected,
  flashCard,
  onSelect,
  ...props
}: Readonly<FlashCardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);

  const [onStart, onEnd, onMove] = useLongPress<FlashCard>(
    (value) => onSelect && onSelect(value as FlashCard),
    () => setIsFlipped((prev) => !prev),
  );

  return (
    <div
      onMouseDown={() => onStart(flashCard)}
      onMouseUp={onEnd}
      onTouchStart={() => onStart(flashCard)}
      onTouchEnd={onEnd}
      onTouchMove={onMove}
    >
      {!isFlipped && (
        <motion.div
          key={flashCard.frontUuid + '1'}
          animate={{ x: '0%', opacity: 100, zIndex: 21 }}
          initial={{ x: '10%', opacity: 0, zIndex: -20 }}
          exit={{
            x: '-5%',
            opacity: 0,
            zIndex: -20,
          }}
          className='flex justify-center'
        >
          <Card
            key={flashCard.frontUuid}
            // onKeyDown={handleKeyDown}
            tabIndex={0}
            className={cn([
              'z-10 h-96 w-80 flex-col items-center p-4',
              isSelected ? 'ring ring-green-400/60' : '',
            ])}
            {...props}
          >
            <h5
              className={`z-20 flex h-20 w-full items-center justify-center rounded-md text-center text-sm`}
            >
              Q: {flashCard.question}
            </h5>

            <h2 className='text z-20 flex h-full w-full justify-center rounded-md pt-16 text-center text-5xl text-green-400'>
              {flashCard.questionAddition}
            </h2>
          </Card>
        </motion.div>
      )}

      {isFlipped && (
        <motion.div
          key={flashCard.frontUuid + '2'}
          animate={{ x: '0%', opacity: 100, zIndex: 20 }}
          initial={{ x: '10%', opacity: 0, zIndex: -20 }}
          exit={{
            x: '-5%',
            opacity: 0,
            zIndex: -20,
          }}
          className='flex justify-center'
        >
          <Card
            key={flashCard.frontUuid}
            // onKeyDown={handleKeyDown}
            tabIndex={0}
            className={cn([
              'z-10 h-96 w-80 flex-col items-center p-4',
              isSelected ? 'ring ring-green-400/60' : '',
            ])}
            {...props}
          >
            <p
              className={`z-20 flex h-full w-full items-center justify-center rounded-md px-4 text-center text-gray-500 dark:text-slate-400`}
            >
              {flashCard.answer}
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
