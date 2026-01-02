import { db } from '#/db/dexie.db';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { metadataMerge } from '#/shared/helpers/metadata-merge';
import { createClient } from '#/shared/utils/supabase/client';
import type { Metadata } from '#/types/metadata.type';
import type { StateCreator } from 'zustand';
import type { AppState, MetadataSlice } from '../app-state';

export const createMetadataSlice: StateCreator<
  AppState,
  [],
  [],
  MetadataSlice
> = (set) => ({
  // Initial state
  theme: 'dark',
  avatarSeed: '',

  // Actions
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  },

  setAvatarSeed: (avatarSeed) => {
    set({ avatarSeed });
  },

  updateMetadata: async (update: Partial<Metadata>) => {
    const supabase = createClient();

    const updatedMetadata = metadataMerge(defaultMetadata, update);

    await db.metadata.update('current', {
      ...updatedMetadata,
      updatedAt: new Date().toUTCString(),
    });

    await supabase.from('metadata').update(updatedMetadata);
  },
});
