interface Window {
  umami: {
    track: (event_name: string, props?: Record<string, unknown>) => void;
    trackEvent: (event_name: string, props?: Record<string, unknown>) => void;
    trackView: (url?: string) => void;
  }
}
