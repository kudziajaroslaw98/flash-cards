'use client';

import useAppStore from '#/store/app-store';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

export function AIStreamMediator() {
  const {
    streamTrigger,
    abortStream,
    finishStream,
    streamingAPI,
    setStopStreamCallback,
  } = useAppStore(
    useShallow((state) => ({
      streamTrigger: state.streamTrigger,
      abortStream: state.abortStream,
      finishStream: state.finishStream,
      streamingAPI: state.streamingAPI,
      isStreaming: state.isStreaming,
      setStopStreamCallback: state.setStopStreamCallback,
    }))
  );

  const currentStreamIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setStopStreamCallback(stopStream);
  }, [stopStream, setStopStreamCallback]);

  useEffect(() => {
    if (
      !streamTrigger ||
      streamingAPI === null ||
      streamTrigger.id === null ||
      streamTrigger.id === currentStreamIdRef.current
    ) {
      return;
    }

    currentStreamIdRef.current = streamTrigger.id;
    const streamId = streamTrigger.id;

    const executeStream = async () => {
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(streamingAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(streamTrigger.body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Send the accumulated text to the callback
          streamTrigger.onStreamChunk({
            type: 'text',
            text: accumulatedText,
            delta: chunk,
          });
        }

        if (currentStreamIdRef.current === streamId) {
          finishStream(streamId);
          currentStreamIdRef.current = null;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Stream was intentionally stopped
          return;
        }

        console.error('Stream error:', error);

        if (currentStreamIdRef.current === streamId) {
          abortStream(
            error instanceof Error ? error.message : 'Stream failed'
          );
          currentStreamIdRef.current = null;
        }
      } finally {
        abortControllerRef.current = null;
      }
    };

    executeStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [streamTrigger, streamingAPI, abortStream, finishStream]);

  return null; // This component is headless
}
