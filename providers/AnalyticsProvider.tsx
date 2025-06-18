'use client';

import { useEffect } from 'react';
import { usePageTracking } from '@/hooks/use-mixpanel';
import { loadGoogleAnalytics, googleAnalytics } from '@/lib/google-analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Automatically track page views with Mixpanel
  usePageTracking();

  useEffect(() => {
    // Load Google Analytics
    loadGoogleAnalytics();

    // Track initial app load in both analytics platforms
    if (typeof window !== 'undefined') {
      // Mixpanel tracking
      const { analytics } = require('@/lib/mixpanel');
      analytics.track('App Loaded', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // Google Analytics tracking
      googleAnalytics.event('app_loaded', {
        event_category: 'app',
        user_agent: navigator.userAgent,
      });
    }
  }, []);

  return <>{children}</>;
}
