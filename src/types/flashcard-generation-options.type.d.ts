import { CardLength } from './card-length.type';
import { KnowledgeLevel } from './knowledge-level.type';
import { LearningStyleAdaptation } from './learning-style.type';
import { MnemonicPreferences } from './mnemonic-preference.type';

export interface FlashcardGenerationOptions {
  knowledgeLevel?: KnowledgeLevel;
  focusAreas?: string[];
  cardLength?: CardLength;
  learningStyle?: LearningStyleAdaptation;
  mnemonic?: MnemonicPreferences;
  blacklist?: string[];
  additionalUserPrompt?: string;
}
