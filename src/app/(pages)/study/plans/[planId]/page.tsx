import { StudyPlan } from '#/components/study-plan/study-plan';

type Params = Promise<{ planId: string }>;

export default async function StudyPlanPage(props: { params: Params }) {
  const { planId } = await props.params;
  return <StudyPlan planId={planId} />;
}
