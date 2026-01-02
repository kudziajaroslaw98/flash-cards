export type ToastStepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface ToastStep {
  label: string;
  status: ToastStepStatus;
}

export interface StreamingToastState {
  toastId: string | null;
  isOpen: boolean;
  header: string;
  message: string;
  step: number;
  totalSteps: number;
  error: string | null;
  steps: ToastStep[];
}
