import { z } from 'zod';

export const planStudyScopeSchema = z.enum(
  ['default', 'comprehensive', 'specific'],
  {
    invalid_type_error: 'Study Scope is invalid',
    required_error: 'Study Scope is required',
    description: 'Study Scope',
    message: 'Study Scope is invalid',
  },
);
