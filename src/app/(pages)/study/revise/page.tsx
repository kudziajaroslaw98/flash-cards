import { PlanRevise } from '#/components/plan-revise/plan-revise';
import RevisePlanProvider from '#/providers/revise-plan-provider';

export default function PlanRevisePage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center'>
      <RevisePlanProvider>
        <PlanRevise />
      </RevisePlanProvider>
    </div>
  );
}
