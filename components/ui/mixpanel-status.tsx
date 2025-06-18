'use client';

import { useEffect, useState } from 'react';

export function MixpanelStatus() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    setToken(mixpanelToken || null);
    setIsEnabled(!!mixpanelToken);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>📊 Mixpanel: {isEnabled ? '✅ Active' : '❌ Disabled'}</div>
      {!isEnabled && <div className="text-red-300">Set NEXT_PUBLIC_MIXPANEL_TOKEN</div>}
    </div>
  );
}
