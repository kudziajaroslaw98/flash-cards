interface Window {
  umami?: {
    track: (event_name: string, props?: Record<string, any>) => void;
    trackEvent: (event_name: string, props?: Record<string, any>) => void;
    trackView: (url?: string) => void;
  }
}
