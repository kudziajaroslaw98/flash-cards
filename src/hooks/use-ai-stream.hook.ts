import useAppStore from '#/store/app-store';
import type { ToastStep } from '#/types/streaming-toast.type';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

export interface StreamChunk {
  type: 'text';
  text: string;
  delta: string;
}

export interface UseAIStreamOptions {
  api: string;
  header?: string;
  steps?: ToastStep[];
  onChunk?: (chunk: StreamChunk) => void;
  onFinish?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAIStream() {
  const {
    isStreaming,
    streamingError,
    triggerStream,
    stopStream,
    showStreamingToast,
    setStreamSteps,
    hideStreamingToast,
    setStreamingToastError,
  } = useAppStore(
    useShallow((state) => ({
      isStreaming: state.isStreaming,
      streamingError: state.streamingError,
      triggerStream: state.triggerStream,
      stopStream: state.stopStream,
      showStreamingToast: state.showStreamingToast,
      setStreamSteps: state.setStreamSteps,
      hideStreamingToast: state.hideStreamingToast,
      setStreamingToastError: state.setStreamingToastError,
    }))
  );

  const startStream = useCallback(
    (
      options: UseAIStreamOptions,
      body: Record<string, unknown>
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        let finalText = '';

        // Show toast if header provided
        if (options.header) {
          showStreamingToast(options.header);
        }

        // Set steps if provided
        if (options.steps) {
          setStreamSteps(options.steps);
        }

        const handleChunk = (chunk: unknown) => {
          const typedChunk = chunk as StreamChunk;

          if (typedChunk.type === 'text') {
            finalText = typedChunk.text;
            options.onChunk?.(typedChunk);
          }
        };

        // Store the callbacks for completion handling
        const originalOnFinish = options.onFinish;
        const originalOnError = options.onError;

        // We need to handle completion in the store's finishStream
        // For now, we'll use a polling approach or rely on the callback
        const checkInterval = setInterval(() => {
          const state = useAppStore.getState();

          if (!state.isStreaming && finalText) {
            clearInterval(checkInterval);
            originalOnFinish?.(finalText);
            resolve(finalText);
          }

          if (state.streamingError) {
            clearInterval(checkInterval);
            originalOnError?.(state.streamingError);
            reject(new Error(state.streamingError));
          }
        }, 100);

        // Trigger the stream
        triggerStream(options.api, body, handleChunk);

        // Cleanup after 5 minutes max
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 300000);
      });
    },
    [triggerStream, showStreamingToast, setStreamSteps]
  );

  const cancel = useCallback(() => {
    stopStream();
  }, [stopStream]);

  return {
    isStreaming,
    streamingError,
    startStream,
    cancel,
    showToast: showStreamingToast,
    hideToast: hideStreamingToast,
    setToastError: setStreamingToastError,
    setSteps: setStreamSteps,
  };
}
