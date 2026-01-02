import { db } from '#/db/dexie.db';
import { localToRemoteDailyStatsSync } from '#/shared/helpers/sync/local-to-remote/daily-stats-sync';
import { localToRemoteFlashcardsSync } from '#/shared/helpers/sync/local-to-remote/flashcards-sync';
import { localToRemoteFocusSessionsSync } from '#/shared/helpers/sync/local-to-remote/focus-sessions-sync';
import { localToRemoteMetadataSync } from '#/shared/helpers/sync/local-to-remote/metadata-sync';
import { localToRemoteRemindersSync } from '#/shared/helpers/sync/local-to-remote/reminders-sync';
import { localToRemoteReviewLogsSync } from '#/shared/helpers/sync/local-to-remote/review-logs-sync';
import { localToRemoteSetsSync } from '#/shared/helpers/sync/local-to-remote/sets-sync';
import { remoteToLocalDailyStatsSync } from '#/shared/helpers/sync/remote-to-local/daily-stats-sync';
import { remoteToLocalFlashcardsSync } from '#/shared/helpers/sync/remote-to-local/flashcards-sync';
import { remoteToLocalFocusSessionsSync } from '#/shared/helpers/sync/remote-to-local/focus-sessions-sync';
import { remoteToLocalMetadataSync } from '#/shared/helpers/sync/remote-to-local/metadata-sync';
import { remoteToLocalRemindersSync } from '#/shared/helpers/sync/remote-to-local/reminders-sync';
import { remoteToLocalReviewLogsSync } from '#/shared/helpers/sync/remote-to-local/review-logs-sync';
import { remoteToLocalSetsSync } from '#/shared/helpers/sync/remote-to-local/sets-sync';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/client';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { StateCreator } from 'zustand';
import type { AppState, SyncSlice } from '../app-state';

let websocketChannel: RealtimeChannel | null = null;

export const createSyncSlice: StateCreator<AppState, [], [], SyncSlice> = (
  set,
  get
) => ({
  // Initial state
  isSyncing: false,
  lastSyncAt: null,

  // Actions
  syncLocalToRemote: async () => {
    const { isLoggedIn, user } = get();
    if (!isLoggedIn || user === null) return;

    const supabase = createClient();
    const metadata = await db.metadata.get('current');
    const newLastSyncAt = new Date().toUTCString();
    let lastSyncAt: string;

    if (
      metadata === undefined ||
      metadata.lastSyncAt === null ||
      metadata.lastSyncAt === undefined ||
      isNaN(new Date(metadata.lastSyncAt).getTime())
    ) {
      lastSyncAt = new Date(0).toUTCString();
    } else {
      lastSyncAt = new Date(metadata.lastSyncAt).toUTCString();
    }

    const fiveMinsInMillis = 5 * 60 * 1000;
    if (
      new Date().getTime() - new Date(lastSyncAt).getTime() <
      fiveMinsInMillis
    ) {
      console.log(
        'Sync [local => remote] skipped: Last sync was less than 5 minutes ago.'
      );
      return;
    }

    set({ isSyncing: true });

    await Promise.allSettled([
      localToRemoteFlashcardsSync(supabase, user),
      localToRemoteSetsSync(supabase, user),
      localToRemoteMetadataSync(supabase, user, newLastSyncAt),
      localToRemoteFocusSessionsSync(supabase, user),
      localToRemoteDailyStatsSync(supabase, user),
      localToRemoteRemindersSync(supabase, user),
    ]);

    await localToRemoteReviewLogsSync(supabase, user);

    set({ isSyncing: false, lastSyncAt: new Date(newLastSyncAt) });
  },

  syncRemoteToLocal: async () => {
    const { isLoggedIn, user } = get();
    if (!isLoggedIn || user === null) return;

    const supabase = createClient();
    const metadata = await db.metadata.get('current');
    const newLastSyncAt = new Date().toUTCString();
    const emptyMetadata = metadata === undefined;
    let lastSyncAt: string;

    if (
      metadata === undefined ||
      metadata.lastSyncAt === null ||
      metadata.lastSyncAt === undefined ||
      isNaN(new Date(metadata.lastSyncAt).getTime())
    ) {
      lastSyncAt = new Date(0).toUTCString();
    } else {
      lastSyncAt = new Date(metadata.lastSyncAt).toUTCString();
    }

    const fiveMinsInMillis = 5 * 60 * 1000;
    if (
      new Date().getTime() - new Date(lastSyncAt).getTime() <
      fiveMinsInMillis
    ) {
      console.log(
        'Sync [remote => local] skipped: Last sync was less than 5 minutes ago.'
      );
      return;
    }

    set({ isSyncing: true });

    await Promise.allSettled([
      remoteToLocalFlashcardsSync(supabase, lastSyncAt),
      remoteToLocalSetsSync(supabase, lastSyncAt),
      remoteToLocalMetadataSync(
        supabase,
        lastSyncAt,
        emptyMetadata,
        user,
        metadata
      ),
      remoteToLocalFocusSessionsSync(supabase, lastSyncAt),
      remoteToLocalDailyStatsSync(supabase, lastSyncAt),
      remoteToLocalRemindersSync(supabase, lastSyncAt),
    ]);

    await remoteToLocalReviewLogsSync(supabase, lastSyncAt);

    await db.metadata.update('current', {
      lastSyncAt: new Date(newLastSyncAt),
      synced: true,
      updatedAt: new Date().toUTCString(),
    });

    set({ isSyncing: false, lastSyncAt: new Date(newLastSyncAt) });
  },

  initializeWebsockets: async () => {
    const { isLoggedIn, user } = get();
    if (!isLoggedIn || !user) return;

    const supabase = createClient();
    const userChannel = supabase.channel(`user-${user.id}`);
    websocketChannel = userChannel;

    // FLASHCARDS - UPDATE
    websocketChannel
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'flashcards' },
        async (payload) => {
          if (payload.new) {
            const updatedFlashcard = payload.new as Flashcard & {
              user_uuid: string;
              id: string;
            };
            await db.flashcards.put(
              omit(updatedFlashcard, ['user_uuid', 'id']) as Flashcard
            );
          }
        }
      )
      // FLASHCARDS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flashcards' },
        async (payload) => {
          if (payload.new) {
            const newFlashcard = payload.new as Flashcard & {
              user_uuid: string;
              id: string;
            };
            await db.flashcards.put(
              omit(newFlashcard, ['user_uuid', 'id']) as Flashcard
            );
          }
        }
      )
      // FLASHCARDS - DELETE
      .on('broadcast', { event: 'flashcards_delete' }, async ({ payload }) => {
        if (
          payload.flashcards &&
          payload.flashcards.length >= 0 &&
          Array.isArray(payload.flashcards)
        ) {
          await db.flashcards.bulkDelete(payload.flashcards);
        }
      })
      // SETS - UPDATE
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sets' },
        async (payload) => {
          if (payload.new) {
            const updatedSet = payload.new as FlashcardSet & {
              user_uuid: string;
              id: string;
            };
            await db.sets.put(
              omit(updatedSet, ['user_uuid', 'id']) as FlashcardSet
            );
          }
        }
      )
      // SETS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sets' },
        async (payload) => {
          if (payload.new) {
            const newSet = payload.new as FlashcardSet & {
              user_uuid: string;
              id: string;
            };
            await db.sets.put(omit(newSet, ['user_uuid', 'id']) as FlashcardSet);
          }
        }
      )
      // SETS - DELETE
      .on('broadcast', { event: 'sets_delete' }, async ({ payload }) => {
        if (
          payload?.sets &&
          payload?.sets.length >= 0 &&
          Array.isArray(payload?.sets)
        ) {
          await db.sets.bulkDelete(payload?.sets);
        }
      })
      .subscribe();
  },

  cleanupWebsockets: () => {
    if (websocketChannel) {
      const supabase = createClient();
      websocketChannel.unsubscribe();
      supabase.removeChannel(websocketChannel);
      websocketChannel = null;
    }
  },

  syncWithDB: async () => {
    const { isLoggedIn, user, syncLocalToRemote, syncRemoteToLocal, initializeWebsockets } = get();
    if (!isLoggedIn || user === null) return;

    await syncLocalToRemote();
    await syncRemoteToLocal();
    await initializeWebsockets();
  },
});
