'use client';

import { useEffect, useState } from 'react';

export function AnalyticsStatus() {
  const [mixpanelEnabled, setMixpanelEnabled] = useState(false);
  const [gaEnabled, setGaEnabled] = useState(false);
  const [mixpanelToken, setMixpanelToken] = useState<string | null>(null);
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    const mixpanelTokenEnv = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    const gaIdEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    setMixpanelToken(mixpanelTokenEnv || null);
    setGaId(gaIdEnv || null);
    setMixpanelEnabled(!!mixpanelTokenEnv);
    setGaEnabled(!!gaIdEnv);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded text-xs z-50 space-y-1">
      <div className="font-semibold">📊 Analytics Status</div>
      
      <div className="space-y-1">
        <div>
          Mixpanel: {mixpanelEnabled ? '✅ Active' : '❌ Disabled'}
        </div>
        {!mixpanelEnabled && (
          <div className="text-red-300 text-xs">Set NEXT_PUBLIC_MIXPANEL_TOKEN</div>
        )}
        
        <div>
          Google Analytics: {gaEnabled ? '✅ Active' : '❌ Disabled'}
        </div>
        {!gaEnabled && (
          <div className="text-red-300 text-xs">Set NEXT_PUBLIC_GA_MEASUREMENT_ID</div>
        )}
      </div>
      
      {(!mixpanelEnabled || !gaEnabled) && (
        <div className="text-yellow-300 text-xs mt-1">
          Check your .env.local file
        </div>
      )}
    </div>
  );
}
