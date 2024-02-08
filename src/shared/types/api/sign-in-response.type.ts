import type { UserMetadata } from '@supabase/supabase-js';

export type SignInResponse = {
  user_metadata: UserMetadata;
  email?: string;
  phone?: string;
  last_sign_in_at?: string;
  role?: string;
};
