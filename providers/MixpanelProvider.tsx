'use client';

import { useEffect } from 'react';
import { usePageTracking } from '@/hooks/use-mixpanel';

interface MixpanelProviderProps {
  children: React.ReactNode;
}

export function MixpanelProvider({ children }: MixpanelProviderProps) {
  // Automatically track page views
  usePageTracking();

  useEffect(() => {
    // Track initial app load
    if (typeof window !== 'undefined') {
      const { analytics } = require('@/lib/mixpanel');
      analytics.track('App Loaded', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }, []);

  return <>{children}</>;
}
