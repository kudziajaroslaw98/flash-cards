import supabaseAdmin from '#/shared/utils/supabase/admin';
import { permanentRedirect } from 'next/navigation';

export default async function AccountsAdminPage() {
  if (process.env.NODE_ENV !== 'development') {
    permanentRedirect('/dashboard');
  }

  const getUser = await supabaseAdmin.auth.admin.getUserById(
    '2e6b65f4-6973-4d0f-b4f1-8c6218930ba2',
  );
  const handleUpgradeUser = async () => {
    if (getUser.error) {
      console.error('Error fetching user:', getUser.error.message);
      return;
    } else if (
      getUser.data.user.user_metadata.stripe_subscribed_plan === 'premium'
    ) {
      console.log('User is already premium');
      return;
    }

    await supabaseAdmin.auth.admin.updateUserById(
      '2e6b65f4-6973-4d0f-b4f1-8c6218930ba2',
      {
        user_metadata: {
          ...getUser.data.user.user_metadata,
          stripe_subscribed_plan: 'premium',
          stripe_subscription_status: 'active',
        },
      },
    );
  };

  handleUpgradeUser();

  return (
    <>
      {getUser.data.user?.user_metadata.stripe_subscribed_plan}
      {getUser.data.user?.user_metadata.stripe_subscription_status}
    </>
  );
}
