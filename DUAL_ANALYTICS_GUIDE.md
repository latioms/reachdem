# Dual Analytics Integration Guide (Mixpanel + Google Analytics)

This guide explains how to use both Mixpanel and Google Analytics in your ReachDem application for comprehensive user behavior tracking.

## Setup

### 1. Environment Variables

Add both analytics tokens to `.env.local`:

```env
# Mixpanel Configuration
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here

# Google Analytics 4 Configuration  
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### How to get your tokens:

#### Mixpanel Token:
1. Go to [Mixpanel](https://mixpanel.com/settings/project)
2. Login to your account
3. Navigate to Settings → Project Settings
4. Copy your Project Token

#### Google Analytics Measurement ID:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property if you don't have one
3. Navigate to Admin → Data Streams
4. Select your web stream
5. Copy the Measurement ID (starts with G-)

### 2. Installation

The necessary packages are already installed:
- `mixpanel-browser`: Official Mixpanel SDK
- `gtag`: Google Analytics tracking
- `@types/google.analytics`: TypeScript types

## Usage

### Automatic Tracking

Both platforms automatically track:

#### Page Views
- **Mixpanel**: `Page View` event with page, referrer, timestamp
- **Google Analytics**: Automatic page_view with page_location, page_title

#### Navigation
- **Mixpanel**: `Navigation` event with from/to pages
- **Google Analytics**: Custom navigation events

#### App Load
- **Mixpanel**: `App Loaded` event with user agent and URL
- **Google Analytics**: `app_loaded` event

### Dual Analytics Hook

The main hook for tracking to both platforms:

```typescript
import { useDualTracking } from '@/hooks/use-dual-analytics';

const {
  trackAuthEvent,
  trackDashboardEvent,
  trackNavigationEvent,
  trackFormEvent,
  trackEvent
} = useDualTracking();
```

### Authentication Events

```typescript
// Track successful login (both platforms)
trackAuthEvent.login(userId, 'email');

// Track login attempts
trackAuthEvent.loginAttempt(true); // success
trackAuthEvent.loginAttempt(false, 'Invalid credentials'); // failure

// Track signup
trackAuthEvent.signup(userId, 'email');
trackAuthEvent.signupAttempt(true);

// Track logout (clears Mixpanel data, logs GA event)
trackAuthEvent.logout();
```

**What gets tracked:**
- **Mixpanel**: Detailed event with properties + user identification
- **Google Analytics**: Standard GA4 events (login, sign_up, logout) + user_id

### Dashboard Events

```typescript
// Track dashboard views
trackDashboardEvent.viewDashboard('stats');

// Track campaign creation
trackDashboardEvent.createCampaign('SMS');

// Track message sending
trackDashboardEvent.sendMessage('SMS', 150); // 150 recipients

// Track billing actions
trackDashboardEvent.billingAction('recharge', 50.00);
```

**What gets tracked:**
- **Mixpanel**: Custom events with detailed properties
- **Google Analytics**: Enhanced ecommerce events where applicable (purchase for billing)

### Navigation Events

```typescript
// Track sidebar navigation
trackNavigationEvent.sidebarClick('Campaigns');

// Track button clicks  
trackNavigationEvent.buttonClick('Create Campaign', 'dashboard');

// Track modal interactions
trackNavigationEvent.modalOpen('campaign-dialog');
trackNavigationEvent.modalClose('campaign-dialog', 'saved');
```

### Form Tracking

```typescript
import { useFormTracking } from '@/components/ui/tracked-button';

const { trackFormSubmission, trackFormFieldInteraction } = useFormTracking();

// Track form submission
trackFormSubmission('contact-form', true, formData);
trackFormSubmission('contact-form', false, formData, 'Validation error');

// Track field interactions (non-sensitive fields only)
trackFormFieldInteraction('contact-form', 'email', 'focus');
```

### Custom Events

```typescript
import { useDualTracking } from '@/hooks/use-dual-analytics';

const { trackEvent } = useDualTracking();

// Track to both platforms simultaneously
trackEvent('Feature Used', {
  feature: 'CSV Import',
  fileSize: '2.5MB',
  recordCount: 1500,
  category: 'import', // Used as event_category in GA
  label: 'large-file', // Used as event_label in GA
  value: 1500, // Used as value in GA
});
```

## Tracked Components

### TrackedButton

Automatically tracks clicks to both platforms:

```typescript
import { TrackedButton } from '@/components/ui/tracked-button';

<TrackedButton
  trackingName="create-campaign"
  trackingLocation="dashboard"
  trackingProperties={{ campaignType: 'SMS' }}
  onClick={handleCreateCampaign}
>
  Create Campaign
</TrackedButton>
```

## Key Events Being Tracked

### Authentication (Both Platforms)
- Login/Signup attempts and successes
- User identification and properties
- Session management

### Navigation (Both Platforms)
- Page views with referrer tracking
- Sidebar and button interactions
- Modal open/close events

### Business Logic (Both Platforms)
- Campaign creation and management
- Message sending with recipient counts
- Contact management operations
- Billing and payment events

### Technical Events
- **Mixpanel**: Detailed technical data, custom properties
- **Google Analytics**: Standard GA4 events, enhanced ecommerce

## Platform-Specific Features

### Mixpanel Advantages
- Real-time event tracking
- Advanced user segmentation
- Funnel analysis
- Cohort analysis
- Custom properties and user profiles

### Google Analytics Advantages
- Integration with Google Ads
- Enhanced ecommerce tracking
- Automatic demographic data
- Search Console integration
- Free tier with generous limits

## Development Status

In development mode, you'll see an analytics status indicator showing:
- ✅/❌ Mixpanel status
- ✅/❌ Google Analytics status
- Environment variable reminders

## Data Flow

```
User Action
    ↓
useDualTracking Hook
    ├─→ Mixpanel (detailed properties)
    └─→ Google Analytics (GA4 standard events)
```

## Privacy & Compliance

### Automatic Data Protection
- Sensitive fields (passwords, credit cards) are automatically redacted
- User consent should be implemented for GDPR compliance
- Both platforms respect Do Not Track headers

### Data Retention
- **Mixpanel**: Configurable, default 5 years
- **Google Analytics**: 14 months default, configurable

## Best Practices

1. **Event Naming**: Use consistent naming across platforms
2. **Properties**: Include relevant context but avoid PII
3. **Performance**: Events are queued and sent asynchronously
4. **Testing**: Use development environment for testing
5. **Monitoring**: Check both dashboards regularly

## Troubleshooting

### Common Issues

1. **Events not appearing**: Check environment variables
2. **Duplicate events**: Ensure components aren't double-wrapped
3. **Missing data**: Verify network requests in browser dev tools

### Debug Mode

Both platforms support debug mode in development:
- **Mixpanel**: `debug: true` in initialization
- **Google Analytics**: `debug_mode: true` in gtag config

## Integration Examples

### Campaign Flow Tracking
```typescript
// User starts campaign creation
trackNavigationEvent.buttonClick('create-campaign', 'dashboard');

// User opens campaign modal
trackNavigationEvent.modalOpen('campaign-dialog');

// User submits campaign form
trackFormEvent.submit('campaign-form', true, campaignData);

// Campaign is created
trackDashboardEvent.createCampaign('SMS');

// User sends campaign
trackDashboardEvent.sendMessage('SMS', recipientCount);
```

### E-commerce Flow (Billing)
```typescript
// User views billing page
trackDashboardEvent.viewDashboard('billing');

// User initiates recharge
trackNavigationEvent.buttonClick('recharge', 'billing');

// Payment successful
trackDashboardEvent.billingAction('recharge', amount); // Triggers GA purchase event
```

This dual analytics setup gives you the best of both worlds: Mixpanel's detailed user behavior analytics and Google Analytics' comprehensive web analytics platform.
