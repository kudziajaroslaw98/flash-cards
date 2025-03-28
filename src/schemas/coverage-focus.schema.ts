import { z } from 'zod';
export const coverageFocusSchema = z.enum(['broad', 'deep', 'core'], {
  invalid_type_error: 'Coverage Focus is invalid',
  required_error: 'Coverage Focus is required',
  description: 'Coverage Focus',
  message: 'Coverage Focus is invalid',
});
