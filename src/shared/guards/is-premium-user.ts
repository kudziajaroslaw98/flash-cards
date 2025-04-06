import { createClient } from '../utils/supabase/client';

export const isPremiumUser = async (): Promise<boolean> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pickedPlan = user?.user_metadata?.stripe_subscribed_plan ?? null;
  const isPlanActive =
    user?.user_metadata?.stripe_subscription_status === 'active';

  return user !== null && isPlanActive && pickedPlan === 'premium';
};
