import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });
}

// Wrapper functions for type safety and easier usage
export const analytics = {
  // Track page views
  trackPageView: (pageName: string, properties?: Record<string, unknown>) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.track('Page View', {
        page: pageName,
        ...properties,
      });
    }
  },

  // Track custom events
  track: (eventName: string, properties?: Record<string, unknown>) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.track(eventName, properties);
    }
  },

  // Identify user
  identify: (userId: string) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.identify(userId);
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, unknown>) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.people.set(properties);
    }
  },

  // Track user registration
  trackSignUp: (userId: string, properties?: Record<string, unknown>) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.alias(userId);
      mixpanel.track('Sign Up', properties);
    }
  },

  // Track user login
  trackLogin: (userId: string, properties?: Record<string, unknown>) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.identify(userId);
      mixpanel.track('Login', properties);
    }
  },

  // Track navigation events
  trackNavigation: (from: string, to: string, properties?: Record<string, unknown>) => {
    if (MIXPANEL_TOKEN) {
      mixpanel.track('Navigation', {
        from,
        to,
        ...properties,
      });
    }
  },

  // Reset tracking (for logout)
  reset: () => {
    if (MIXPANEL_TOKEN) {
      mixpanel.reset();
    }
  },
};

export default analytics;
