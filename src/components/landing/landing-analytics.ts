export type LandingEventPayload = {
  event: string;
  timestamp: string;
  path: string;
  [key: string]: string | number | boolean | null;
};

export function trackLandingEvent(event: string, data?: Record<string, string | number | boolean | null>) {
  if (typeof window === "undefined") return;

  const payload: LandingEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    ...(data ?? {}),
  };

  // For GTM/analytics tools that listen to dataLayer.
  const w = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push(payload);
  }

  // Internal event bus for local instrumentation/hooks.
  window.dispatchEvent(new CustomEvent("trezalink:landing-event", { detail: payload }));
}
