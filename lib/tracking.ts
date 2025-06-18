'use client';

import { analytics } from '@/lib/mixpanel';

export const trackAuthEvent = {
  login: (userId: string, method: string = 'email') => {
    analytics.trackLogin(userId, {
      method,
      timestamp: new Date().toISOString(),
    });
  },

  signup: (userId: string, method: string = 'email') => {
    analytics.trackSignUp(userId, {
      method,
      timestamp: new Date().toISOString(),
    });
  },

  logout: () => {
    analytics.track('Logout', {
      timestamp: new Date().toISOString(),
    });
    analytics.reset();
  },

  loginAttempt: (success: boolean, error?: string) => {
    analytics.track('Login Attempt', {
      success,
      error: error || null,
      timestamp: new Date().toISOString(),
    });
  },

  signupAttempt: (success: boolean, error?: string) => {
    analytics.track('Signup Attempt', {
      success,
      error: error || null,
      timestamp: new Date().toISOString(),
    });
  },
};

export const trackDashboardEvent = {
  viewDashboard: (section?: string) => {
    analytics.track('Dashboard View', {
      section,
      timestamp: new Date().toISOString(),
    });
  },

  createCampaign: (campaignType?: string) => {
    analytics.track('Campaign Created', {
      type: campaignType,
      timestamp: new Date().toISOString(),
    });
  },

  sendMessage: (messageType: string, recipientCount: number) => {
    analytics.track('Message Sent', {
      type: messageType,
      recipientCount,
      timestamp: new Date().toISOString(),
    });
  },

  manageContacts: (action: string, contactCount?: number) => {
    analytics.track('Contacts Management', {
      action,
      contactCount,
      timestamp: new Date().toISOString(),
    });
  },

  billingAction: (action: string, amount?: number) => {
    analytics.track('Billing Action', {
      action,
      amount,
      timestamp: new Date().toISOString(),
    });
  },
};

export const trackNavigationEvent = {
  sidebarClick: (section: string) => {
    analytics.track('Sidebar Navigation', {
      section,
      timestamp: new Date().toISOString(),
    });
  },
  buttonClick: (buttonName: string, location: string, additionalProps?: Record<string, any>) => {
    analytics.track('Button Click', {
      buttonName,
      location,
      ...additionalProps,
      timestamp: new Date().toISOString(),
    });
  },

  modalOpen: (modalName: string) => {
    analytics.track('Modal Opened', {
      modalName,
      timestamp: new Date().toISOString(),
    });
  },

  modalClose: (modalName: string, action?: string) => {
    analytics.track('Modal Closed', {
      modalName,
      action: action || 'dismissed',
      timestamp: new Date().toISOString(),
    });
  },
};
