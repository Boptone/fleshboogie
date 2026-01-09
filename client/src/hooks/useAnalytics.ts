import { useEffect, useRef } from 'react';
import { trpc } from '../lib/trpc';

/**
 * Generate or retrieve a session ID for analytics tracking
 * Stored in sessionStorage to persist across page navigations within the same session
 */
function getSessionId(): string {
  const key = 'fleshboogie_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

/**
 * Hook to track page views automatically
 * Call this in your main App component or layout
 */
export function usePageViewTracking() {
  const trackEvent = trpc.analytics.trackEvent.useMutation();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;
    hasTracked.current = true;

    const sessionId = getSessionId();
    const metadata = {
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
    };

    trackEvent.mutate({
      eventType: 'page_view',
      metadata,
      sessionId,
    });
  }, [trackEvent]);
}

/**
 * Hook to manually track custom events
 */
export function useAnalytics() {
  const trackEvent = trpc.analytics.trackEvent.useMutation();

  const trackPageView = (page?: string) => {
    const sessionId = getSessionId();
    trackEvent.mutate({
      eventType: 'page_view',
      metadata: {
        page: page || window.location.pathname,
        referrer: document.referrer || 'direct',
      },
      sessionId,
    });
  };

  const trackNewsletterSignup = (email: string) => {
    const sessionId = getSessionId();
    trackEvent.mutate({
      eventType: 'newsletter_signup',
      metadata: {
        page: window.location.pathname,
      },
      sessionId,
    });
  };

  const trackFeaturedArtistView = (artistName: string) => {
    const sessionId = getSessionId();
    trackEvent.mutate({
      eventType: 'featured_artist_view',
      metadata: {
        artistName,
        page: window.location.pathname,
      },
      sessionId,
    });
  };

  return {
    trackPageView,
    trackNewsletterSignup,
    trackFeaturedArtistView,
  };
}
