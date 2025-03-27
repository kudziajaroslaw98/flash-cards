import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { z } from 'zod';

export type MnemonicPreferences = z.infer<typeof mnemonicPreferencesSchema>;
