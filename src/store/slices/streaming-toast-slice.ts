import type {
  StreamingToastState,
  ToastStep,
} from '#/types/streaming-toast.type';
import type { StateCreator } from 'zustand';
import type { AppState } from '../app-state';

export interface StreamingToastSlice {
  // State
  streamingToast: StreamingToastState;

  // Actions
  showStreamingToast: (header: string) => void;
  setStreamSteps: (steps: ToastStep[]) => void;
  updateStreamingToast: (update: Partial<StreamingToastState>) => void;
  hideStreamingToast: () => void;
  setStreamingToastError: (error: string) => void;
  clearStreamingToast: () => void;
}

const initialToastState: StreamingToastState = {
  toastId: null,
  isOpen: false,
  header: '',
  message: '',
  step: 0,
  totalSteps: 1,
  error: null,
  steps: [],
};

export const createStreamingToastSlice: StateCreator<
  AppState,
  [],
  [],
  StreamingToastSlice
> = (set, get) => ({
  streamingToast: { ...initialToastState },

  showStreamingToast: (header: string) => {
    const newToastId = `streaming-toast-${Date.now()}`;
    set({
      streamingToast: {
        toastId: newToastId,
        isOpen: true,
        header,
        message: 'Initializing...',
        step: 0,
        totalSteps: 1,
        error: null,
        steps: [],
      },
    });
  },

  setStreamSteps: (steps: ToastStep[]) => {
    set((state) => ({
      streamingToast: {
        ...state.streamingToast,
        steps: steps,
        totalSteps: steps.length,
      },
    }));
  },

  updateStreamingToast: (update: Partial<StreamingToastState>) => {
    const { streamingToast } = get();
    const currentStepNumber = update.step ?? streamingToast.step;

    const updatedSteps: ToastStep[] = streamingToast.steps.map((s, index) => {
      const currentStatus = s.status;

      if (index < currentStepNumber - 1) {
        return { ...s, status: 'completed' as const };
      }

      if (index === currentStepNumber - 1) {
        return {
          ...s,
          status: currentStatus === 'error' ? 'error' : ('active' as const),
        };
      }

      return { ...s, status: 'pending' as const };
    });

    set({
      streamingToast: {
        ...streamingToast,
        ...update,
        steps: updatedSteps,
        error: null,
      },
    });
  },

  hideStreamingToast: () => {
    const { streamingToast } = get();
    set({
      streamingToast: {
        ...streamingToast,
        message: 'Streaming complete',
      },
    });

    setTimeout(() => {
      set({
        streamingToast: { ...initialToastState },
      });
    }, 3000);
  },

  setStreamingToastError: (error: string) => {
    const { streamingToast } = get();

    const currentStepIndex = streamingToast.step - 1;
    const updatedSteps = [...streamingToast.steps];

    if (currentStepIndex >= 0 && currentStepIndex < updatedSteps.length) {
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: 'error',
      };
    }

    set({
      streamingToast: {
        ...streamingToast,
        error: error,
        message: 'An error occurred.',
        steps: updatedSteps,
      },
    });
  },

  clearStreamingToast: () => {
    set({
      streamingToast: { ...initialToastState },
    });
  },
});
