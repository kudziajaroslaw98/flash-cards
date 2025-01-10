type ReviseOptionsProps = {
  items: unknown[];
  onSelect: (item: unknown) => void;
  component: React.ReactNode;
};

export function ReviseOptions({ items, ...props }: ReviseOptionsProps) {
  return (
    <div className='mt-8 grid gap-2 xl:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
      {items.map((item, index) => (
        <div key={'revise-option-' + index}>{props.component}</div>
      ))}
      {/* {revisedCard?.type === 'index' && (
        <>
          {spaceRepetitionOptions.map((option, index) => (
            <div
              className={cn([
                'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:border-slate-800/40 dark:hover:bg-slate-800',
                option.value === 'Again' &&
                  'border-red-400 dark:border-red-950/70',
                option.value === 'Hard' &&
                  'border-yellow-400 dark:border-yellow-950/70',
                option.value === 'Good' &&
                  'border-blue-400 dark:border-blue-950/70',
                option.value === 'Easy' &&
                  'border-green-400 dark:border-green-950/70',
              ])}
              key={`answer-${index}`}
            >
              <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                {index + 1}
              </span>

              <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                {option.label} - {option.description}
              </span>
            </div>
          ))}
        </>
      )}
      {revisedCard?.type === 'single' && revisedCard !== null && (
        <div
          className={cn([
            'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800',
            clickedCard?.frontUuid === revisedCard.frontUuid &&
              isCorrect(revisedCard) &&
              'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
            clickedCard?.frontUuid === revisedCard.frontUuid &&
              !isCorrect(revisedCard) &&
              'border-red-400/50 bg-red-400/20 hover:!bg-red-100 dark:!border-red-400/40 dark:bg-red-400/20 dark:hover:!bg-red-400/20',
          ])}
          key={`answer-1`}
          onClick={() => changeClicked(revisedCard)}
        >
          <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'></span>

          <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
            {revisedCard.answer}
          </span>
        </div>
      )} */}
    </div>
  );
}
