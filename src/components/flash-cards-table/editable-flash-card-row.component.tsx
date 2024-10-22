import { FlashCard } from '#/shared/models/flash-card.model';
import { motion } from 'framer-motion';

interface EditableFlashCardRowProps {
  index: number;
  flashCard: FlashCard;
  toggleSelected: (_flashCard: FlashCard) => void;
  isSelected: (_flashCard: FlashCard) => boolean;
}

export default function EditableFlashCardRowComponent(
  props: EditableFlashCardRowProps,
) {
  return (
    <motion.tr
      key={props.flashCard.frontUuid}
      onClick={() => props.toggleSelected(props.flashCard)}
      onKeyDown={(e) =>
        e.key === 'Enter' && props.toggleSelected(props.flashCard)
      }
      className={`flex cursor-pointer rounded-md border shadow-table-row transition-all ${
        props.isSelected(props.flashCard)
          ? 'border-green-400/50 bg-green-100 dark:border-green-600/40 dark:bg-green-500/20'
          : 'border-transparent bg-gray-100 dark:border-slate-800 dark:bg-slate-900'
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
    >
      <motion.td className='flex min-w-12 cursor-pointer items-start justify-center border-r border-r-slate-300/20 p-4 text-sm dark:border-r-slate-700/20 dark:text-slate-300'>
        {props.index + 1}
      </motion.td>

      <motion.td className='z-20 flex w-full min-w-44 flex-col items-start gap-2 p-4 text-sm text-gray-800 dark:text-slate-200 md:w-auto md:flex-row  md:border-r md:border-r-slate-300/20 md:dark:border-r-slate-700/20 '>
        <div
          className={` w-full rounded-md !border-transparent text-lg font-semibold outline-none ring-blue-400 transition-all focus:ring-1 md:text-base`}
          key={`word-${props.flashCard.frontUuid}`}
        >
          {props.flashCard.question}
        </div>

        <div
          className={`flex rounded-md !border-transparent text-gray-500 dark:text-slate-400  md:hidden`}
          key={`definition-top-${props.flashCard.frontUuid}`}
        >
          {props.flashCard.question}
        </div>
      </motion.td>

      <motion.td className='hidden w-full items-start  p-4 text-sm text-gray-500  dark:text-slate-400 md:flex'>
        <div
          className={`hidden rounded-md !border-transparent md:flex`}
          key={`definition-right-${props.flashCard.frontUuid}`}
        >
          {props.flashCard.answer}
        </div>
      </motion.td>
    </motion.tr>
  );
}
