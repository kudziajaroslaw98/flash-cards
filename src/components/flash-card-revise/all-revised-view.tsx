import { Button } from '../_ui/button/button';
import { AllRevised } from './all-revised';

export function AllRevisedView({ onContinue }: { onContinue: () => void }) {
  return (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
        <AllRevised>
          <Button
            label='Continue with All Cards'
            size='sm'
            onClick={onContinue}
            alt='Continue reshuffling with all cards'
          />
        </AllRevised>
      </div>
    </div>
  );
}
