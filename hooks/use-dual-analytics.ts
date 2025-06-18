import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/mixpanel';
import { googleAnalytics } from '@/lib/google-analytics';

export function useDualAnalytics() {
  return {
    mixpanel: analytics,
    ga: googleAnalytics,
  };
}

export function useDualPageTracking() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string>('');

  useEffect(() => {
    const currentPath = pathname;
    const previousPath = previousPathnameRef.current;
    const currentUrl = window.location.href;

    // Track page view in Mixpanel
    analytics.trackPageView(currentPath, {
      referrer: previousPath || 'direct',
      timestamp: new Date().toISOString(),
    });

    // Track page view in Google Analytics
    googleAnalytics.pageView(currentUrl, document.title);

    // Track navigation if there was a previous path
    if (previousPath && previousPath !== currentPath) {
      // Mixpanel navigation tracking
      analytics.trackNavigation(previousPath, currentPath, {
        timestamp: new Date().toISOString(),
      });

      // Google Analytics navigation tracking
      googleAnalytics.navigation(`${previousPath} → ${currentPath}`, currentUrl, 'page_navigation');
    }

    // Update the previous pathname
    previousPathnameRef.current = currentPath;
  }, [pathname]);
}

export function useDualTracking() {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Track in Mixpanel
    analytics.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Track in Google Analytics
    googleAnalytics.event(eventName.toLowerCase().replace(/\s+/g, '_'), {
      event_category: properties?.category || 'engagement',
      event_label: properties?.label,
      value: properties?.value,
      ...properties,
    });
  };

  const trackAuthEvent = {
    login: (userId: string, method: string = 'email') => {
      // Mixpanel
      analytics.trackLogin(userId, { method });
      
      // Google Analytics
      googleAnalytics.login(method);
      googleAnalytics.setUserId(userId);
    },

    signup: (userId: string, method: string = 'email') => {
      // Mixpanel
      analytics.trackSignUp(userId, { method });
      
      // Google Analytics
      googleAnalytics.signUp(method);
      googleAnalytics.setUserId(userId);
    },

    logout: () => {
      // Mixpanel
      analytics.track('Logout', { timestamp: new Date().toISOString() });
      analytics.reset();
      
      // Google Analytics
      googleAnalytics.event('logout', { event_category: 'auth' });
    },

    loginAttempt: (success: boolean, error?: string) => {
      // Mixpanel
      analytics.track('Login Attempt', {
        success,
        error: error || null,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('login_attempt', {
        event_category: 'auth',
        success,
        error_message: error || null,
      });
    },

    signupAttempt: (success: boolean, error?: string) => {
      // Mixpanel
      analytics.track('Signup Attempt', {
        success,
        error: error || null,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('signup_attempt', {
        event_category: 'auth',
        success,
        error_message: error || null,
      });
    },
  };

  const trackDashboardEvent = {
    viewDashboard: (section?: string) => {
      // Mixpanel
      analytics.track('Dashboard View', {
        section,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('dashboard_view', {
        event_category: 'dashboard',
        event_label: section,
      });
    },

    createCampaign: (campaignType?: string) => {
      // Mixpanel
      analytics.track('Campaign Created', {
        type: campaignType,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('campaign_created', {
        event_category: 'campaigns',
        event_label: campaignType,
      });
    },

    sendMessage: (messageType: string, recipientCount: number) => {
      // Mixpanel
      analytics.track('Message Sent', {
        type: messageType,
        recipientCount,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('message_sent', {
        event_category: 'campaigns',
        event_label: messageType,
        value: recipientCount,
      });
    },

    billingAction: (action: string, amount?: number) => {
      // Mixpanel
      analytics.track('Billing Action', {
        action,
        amount,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      if (action === 'recharge' && amount) {
        googleAnalytics.purchase(`billing_${Date.now()}`, amount, 'EUR');
      } else {
        googleAnalytics.event('billing_action', {
          event_category: 'billing',
          event_label: action,
          value: amount,
        });
      }
    },
  };

  const trackNavigationEvent = {
    sidebarClick: (section: string) => {
      // Mixpanel
      analytics.track('Sidebar Navigation', {
        section,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.navigation(section, window.location.href, 'sidebar');
    },

    buttonClick: (buttonName: string, location: string, additionalProps?: Record<string, any>) => {
      // Mixpanel
      analytics.track('Button Click', {
        buttonName,
        location,
        ...additionalProps,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.buttonClick(buttonName, location);
    },

    modalOpen: (modalName: string) => {
      // Mixpanel
      analytics.track('Modal Opened', {
        modalName,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('modal_open', {
        event_category: 'ui',
        event_label: modalName,
      });
    },

    modalClose: (modalName: string, action?: string) => {
      // Mixpanel
      analytics.track('Modal Closed', {
        modalName,
        action: action || 'dismissed',
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.event('modal_close', {
        event_category: 'ui',
        event_label: modalName,
        close_action: action || 'dismissed',
      });
    },
  };

  const trackFormEvent = {
    submit: (formName: string, success: boolean, formData?: Record<string, any>, error?: string) => {
      // Mixpanel
      analytics.track('Form Submit', {
        formName,
        success,
        error: error || null,
        timestamp: new Date().toISOString(),
      });
      
      // Google Analytics
      googleAnalytics.formSubmit(formName, success);
    },

    fieldInteraction: (formName: string, fieldName: string, action: 'focus' | 'blur' | 'change') => {
      // Only track non-sensitive fields
      const isSensitiveField = ['password', 'credit_card', 'ssn', 'token'].some(
        sensitive => fieldName.toLowerCase().includes(sensitive)
      );

      if (!isSensitiveField) {
        // Mixpanel
        analytics.track('Form Field Interaction', {
          formName,
          fieldName,
          action,
          timestamp: new Date().toISOString(),
        });
        
        // Google Analytics
        googleAnalytics.event('form_interaction', {
          event_category: 'form',
          event_label: `${formName}_${fieldName}`,
          interaction_type: action,
        });
      }
    },
  };

  return {
    trackEvent,
    trackAuthEvent,
    trackDashboardEvent,
    trackNavigationEvent,
    trackFormEvent,
  };
}
