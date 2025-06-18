import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/mixpanel';

export function useMixpanel() {
  return analytics;
}

export function usePageTracking() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string>('');

  useEffect(() => {
    const currentPath = pathname;
    const previousPath = previousPathnameRef.current;

    // Track page view
    analytics.trackPageView(currentPath, {
      referrer: previousPath || 'direct',
      timestamp: new Date().toISOString(),
    });

    // Track navigation if there was a previous path
    if (previousPath && previousPath !== currentPath) {
      analytics.trackNavigation(previousPath, currentPath, {
        timestamp: new Date().toISOString(),
      });
    }

    // Update the previous pathname
    previousPathnameRef.current = currentPath;
  }, [pathname]);
}

export function useTrackEvent() {
  const track = (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  };

  return track;
}
