import { z } from 'zod';

export const mnemonicPreferencesSchema = z.enum(
  [
    'acronyms',
    'associations',
    'chunking',
    'visualization',
    'stories',
    'rhymes',
    'mind-palace',
    'mixed',
  ],
  {
    invalid_type_error: 'Mnemonic Preference is invalid',
    required_error: 'Mnemonic Preference is required',
    description: 'Mnemonic Preference',
    message: 'Mnemonic Preference is invalid',
  },
);
