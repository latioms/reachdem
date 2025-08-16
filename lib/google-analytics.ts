// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Initialize Google Analytics
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Helper function to load Google Analytics script
export const loadGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];  window.gtag = function(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Configure Google Analytics
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    debug_mode: process.env.NODE_ENV === 'development',
  });
};

// Google Analytics tracking functions
export const googleAnalytics = {
  // Track page views
  pageView: (url: string, title?: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
    });
  },
  // Track custom events
  event: (action: string, parameters?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: unknown;
  }) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', action, {
      event_category: parameters?.event_category || 'engagement',
      event_label: parameters?.event_label,
      value: parameters?.value,
      ...parameters,
    });
  },

  // Track user login
  login: (method: string = 'email') => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'login', {
      method,
    });
  },

  // Track user signup
  signUp: (method: string = 'email') => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'sign_up', {
      method,
    });
  },

  // Track purchases/conversions
  purchase: (transactionId: string, value: number, currency: string = 'EUR') => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
    });
  },

  // Track search
  search: (searchTerm: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  },

  // Track file downloads
  fileDownload: (fileName: string, fileType?: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'file_download', {
      file_name: fileName,
      file_extension: fileType,
    });
  },

  // Track video interactions
  videoPlay: (videoTitle: string, videoDuration?: number) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'video_play', {
      video_title: videoTitle,
      video_duration: videoDuration,
    });
  },

  // Track form submissions
  formSubmit: (formName: string, success: boolean = true) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'form_submit', {
      form_name: formName,
      success,
    });
  },

  // Track button clicks
  buttonClick: (buttonText: string, location: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'click', {
      event_category: 'button',
      event_label: buttonText,
      custom_location: location,
    });
  },

  // Track navigation
  navigation: (linkText: string, linkUrl: string, linkPosition?: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('event', 'click', {
      event_category: 'navigation',
      event_label: linkText,
      link_url: linkUrl,
      link_position: linkPosition,
    });
  },

  // Set user properties
  setUserProperties: (properties: Record<string, unknown>) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_properties: properties,
    });
  },

  // Set user ID
  setUserId: (userId: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
    });
  },
};

export default googleAnalytics;
