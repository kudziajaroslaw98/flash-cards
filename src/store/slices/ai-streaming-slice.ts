import type { StateCreator } from 'zustand';
import type { AppState } from '../app-state';

export interface StreamTrigger {
  id: string | null;
  body: Record<string, unknown>;
  api: string;
  onStreamChunk: (chunk: unknown) => void;
}

export interface AIStreamingSlice {
  // State
  isStreaming: boolean;
  streamingError: string | null;
  activeStreamId: string | null;
  streamTrigger: StreamTrigger | null;
  streamingAPI: string | null;
  stopStreamCallback: (() => void) | null;

  // Actions
  triggerStream: (
    api: string,
    body: Record<string, unknown>,
    onStreamChunk: (chunk: unknown) => void
  ) => void;
  finishStream: (streamId: string) => void;
  abortStream: (reason: string) => void;
  stopStream: () => void;
  setStopStreamCallback: (callback: () => void) => void;
}

export const createAIStreamingSlice: StateCreator<
  AppState,
  [],
  [],
  AIStreamingSlice
> = (set, get) => ({
  // Initial state
  isStreaming: false,
  streamingError: null,
  activeStreamId: null,
  streamTrigger: null,
  streamingAPI: null,
  stopStreamCallback: null,

  triggerStream: (api, body, onStreamChunk) => {
    const { isStreaming } = get();

    if (isStreaming) {
      console.warn('Stream already in progress, ignoring new trigger');
      return;
    }

    const streamId = `stream_${Date.now()}`;
    set({
      isStreaming: true,
      streamingError: null,
      activeStreamId: streamId,
      streamTrigger: {
        id: streamId,
        api,
        body,
        onStreamChunk,
      },
      streamingAPI: api,
    });
  },

  finishStream: (_streamId: string) => {
    get().hideStreamingToast();
    set({
      isStreaming: false,
      activeStreamId: null,
      streamTrigger: null,
      streamingAPI: null,
      stopStreamCallback: null,
    });
  },

  abortStream: (reason: string) => {
    get().hideStreamingToast();
    set({
      isStreaming: false,
      streamingError: reason,
      activeStreamId: null,
      streamTrigger: null,
      streamingAPI: null,
      stopStreamCallback: null,
    });
  },

  stopStream: () => {
    const { stopStreamCallback } = get();
    if (stopStreamCallback) {
      stopStreamCallback();
    }
    get().hideStreamingToast();
    set({
      isStreaming: false,
      activeStreamId: null,
      streamTrigger: null,
      streamingAPI: null,
      stopStreamCallback: null,
    });
  },

  setStopStreamCallback: (callback) => {
    set({ stopStreamCallback: callback });
  },
});
