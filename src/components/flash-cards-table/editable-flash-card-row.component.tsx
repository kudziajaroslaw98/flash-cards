import TextAreaComponent from '#/components/ui/text-area/text-area.component';
import { FlashCardModel } from '#/utils/models/flash-card.model';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface EditableFlashCardRowProps {
  index: number;
  flashCard: FlashCardModel;
  toggleSelected: (flashCard: FlashCardModel) => void;
  isSelected: (flashCard: FlashCardModel) => boolean;
  definitionChange: (flashCard: FlashCardModel, value: string) => void;
  wordChange: (flashCard: FlashCardModel, value: string) => void;
}

export default function EditableFlashCardRowComponent(
  props: EditableFlashCardRowProps,
) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({
    id: `${props.flashCard.uuid}`,
    data: props.flashCard,
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `${props.flashCard.uuid}`,
    data: props.flashCard,
  });

  return (
    <motion.tr
      key={props.flashCard.uuid}
      ref={(ref) => {
        setDroppableRef(ref);
        setDraggableRef(ref);
      }}
      onKeyDown={(e) =>
        e.key === 'Enter' && props.toggleSelected(props.flashCard)
      }
      className={`flex rounded-md border shadow-table-row transition-all ${
        props.isSelected(props.flashCard)
          ? 'border-green-400/50 bg-green-100 dark:border-green-600/40 dark:bg-green-600'
          : 'border-transparent bg-gray-100 dark:border-slate-700 dark:bg-slate-800'
      }`}
      transition={{
        duration: 0.3,
        type: 'spring',
        staggerChildren: 3,
      }}
      animate={{
        y: '0%',
        opacity: 1,
        zIndex: -20,
        marginTop: 0,
        transitionEnd: { marginTop: 4 },
      }}
      exit={{
        y: '-20%',
        height: 0,
        marginTop: 0,
        opacity: 0,
      }}
      {...listeners}
      {...attributes}
    >
      <motion.td
        onClick={() => props.toggleSelected(props.flashCard)}
        className='flex min-w-12 cursor-pointer items-center justify-center border-r border-r-slate-400/20 p-2 text-sm dark:text-slate-300'
      >
        {props.index + 1}
      </motion.td>

      <motion.td className='z-20 flex w-full min-w-44 flex-col items-start gap-2 p-2 py-4 text-sm text-gray-800 md:w-auto md:flex-row md:items-center md:border-r md:border-r-slate-400/20 md:py-2 dark:text-slate-200'>
        <input
          type='text'
          className={`w-full rounded-md p-2 text-base font-semibold outline-none ring-blue-400 transition-all focus:ring-1 md:text-sm ${
            props.isSelected(props.flashCard)
              ? 'border-green-400/50 bg-green-100 dark:bg-green-600'
              : 'border-transparent bg-gray-100 dark:border-slate-700 dark:bg-slate-800'
          }`}
          id={`word-${props.flashCard.uuid}`}
          onInput={(value) =>
            props.wordChange(props.flashCard, value.currentTarget.value)
          }
          value={props.flashCard.word}
        />
        <TextAreaComponent
          class={`flex md:hidden  ${
            props.isSelected(props.flashCard)
              ? 'border-green-400/50 bg-green-100 dark:bg-green-600'
              : 'border-transparent bg-gray-100 dark:border-slate-700 dark:bg-slate-800'
          }`}
          onInput={(value) => props.definitionChange(props.flashCard, value)}
          value={props.flashCard.definition}
          id={`definition-top-${props.flashCard.uuid}`}
        />
      </motion.td>

      <motion.td className='line-clamp-2 hidden w-full items-center p-2 px-4 text-sm text-gray-700 md:flex dark:text-slate-200'>
        <TextAreaComponent
          class={`hidden md:flex  ${
            props.isSelected(props.flashCard)
              ? 'border-green-400/50 bg-green-100 dark:bg-green-600'
              : 'border-transparent bg-gray-100 dark:border-slate-700 dark:bg-slate-800'
          }`}
          onInput={(value) => props.definitionChange(props.flashCard, value)}
          value={props.flashCard.definition}
          id={`definition-right-${props.flashCard.uuid}`}
        />
      </motion.td>
    </motion.tr>
  );
}
