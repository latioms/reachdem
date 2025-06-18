# Mixpanel Analytics Integration Guide

This guide explains how to use Mixpanel analytics in your ReachDem application to track user behavior and navigation patterns.

## Setup

### 1. Environment Variables

Add your Mixpanel project token to `.env.local`:

```env
NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_mixpanel_token_here
```

To get your Mixpanel token:
1. Go to [Mixpanel](https://mixpanel.com/settings/project)
2. Login to your account
3. Navigate to Settings → Project Settings
4. Copy your Project Token

### 2. Installation

The necessary packages are already installed:
- `mixpanel-browser`: Official Mixpanel SDK
- `@types/mixpanel-browser`: TypeScript types

## Usage

### Automatic Tracking

The following events are automatically tracked:

#### Page Views
- **Event**: `Page View`
- **Properties**: 
  - `page`: Current pathname
  - `referrer`: Previous page or 'direct'
  - `timestamp`: ISO timestamp

#### Navigation
- **Event**: `Navigation`
- **Properties**:
  - `from`: Previous page
  - `to`: Current page
  - `timestamp`: ISO timestamp

#### App Load
- **Event**: `App Loaded`
- **Properties**:
  - `timestamp`: ISO timestamp
  - `userAgent`: Browser user agent
  - `url`: Current URL

### Authentication Events

#### Login
```typescript
import { trackAuthEvent } from '@/lib/tracking';

// Track successful login
trackAuthEvent.login(userId, 'email');

// Track login attempt
trackAuthEvent.loginAttempt(true); // success
trackAuthEvent.loginAttempt(false, 'Invalid credentials'); // failure
```

#### Signup
```typescript
// Track successful signup
trackAuthEvent.signup(userId, 'email');

// Track signup attempt
trackAuthEvent.signupAttempt(true);
trackAuthEvent.signupAttempt(false, 'Email already exists');
```

#### Logout
```typescript
// Track logout (also resets user tracking)
trackAuthEvent.logout();
```

### Dashboard Events

```typescript
import { trackDashboardEvent } from '@/lib/tracking';

// Track dashboard views
trackDashboardEvent.viewDashboard('stats');
trackDashboardEvent.viewDashboard('campaigns');

// Track campaign creation
trackDashboardEvent.createCampaign('SMS');

// Track message sending
trackDashboardEvent.sendMessage('SMS', 150); // 150 recipients

// Track contact management
trackDashboardEvent.manageContacts('import', 100);
trackDashboardEvent.manageContacts('export');

// Track billing actions
trackDashboardEvent.billingAction('recharge', 50.00);
```

### Navigation Events

```typescript
import { trackNavigationEvent } from '@/lib/tracking';

// Track sidebar navigation
trackNavigationEvent.sidebarClick('Campaigns');

// Track button clicks
trackNavigationEvent.buttonClick('Create Campaign', 'dashboard');

// Track modal interactions
trackNavigationEvent.modalOpen('campaign-dialog');
trackNavigationEvent.modalClose('campaign-dialog', 'saved');
```

### Custom Events

```typescript
import { analytics } from '@/lib/mixpanel';

// Track any custom event
analytics.track('Custom Event', {
  property1: 'value1',
  property2: 'value2',
  timestamp: new Date().toISOString(),
});
```

### User Identification

```typescript
import { analytics } from '@/lib/mixpanel';

// Identify user (typically after login)
analytics.identify(userId);

// Set user properties
analytics.setUserProperties({
  email: 'user@example.com',
  plan: 'premium',
  country: 'France',
  signupDate: '2024-01-15',
});
```

## Tracked Button Component

Use the `TrackedButton` component for automatic click tracking:

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

## Form Tracking

Use the form tracking hook for detailed form analytics:

```typescript
import { useFormTracking } from '@/components/ui/tracked-button';

const { trackFormSubmission, trackFormFieldInteraction } = useFormTracking();

// Track form submission
const handleSubmit = async (formData) => {
  try {
    await submitForm(formData);
    trackFormSubmission('contact-form', true, formData);
  } catch (error) {
    trackFormSubmission('contact-form', false, formData, error.message);
  }
};

// Track field interactions
<input
  onFocus={() => trackFormFieldInteraction('contact-form', 'email', 'focus')}
  onChange={(e) => trackFormFieldInteraction('contact-form', 'email', 'change', e.target.value)}
/>
```

## Key Events Being Tracked

### Authentication Flow
- `Login Attempt` (success/failure)
- `Login` (successful authentication)
- `Signup Attempt` (success/failure)
- `Sign Up` (successful registration)
- `Logout` (user logout)

### Navigation
- `Page View` (every page change)
- `Navigation` (moving between pages)
- `Sidebar Navigation` (sidebar menu clicks)
- `Button Click` (tracked button interactions)
- `Modal Opened` / `Modal Closed` (dialog interactions)

### Dashboard Usage
- `Dashboard View` (viewing different dashboard sections)
- `Campaign Created` (new campaign creation)
- `Message Sent` (SMS/email sending)
- `Contacts Management` (contact operations)
- `Billing Action` (payment/billing operations)

### General
- `App Loaded` (initial app load)

## Best Practices

1. **User Privacy**: Sensitive data (passwords, payment info) is automatically redacted
2. **Performance**: Events are queued and sent asynchronously
3. **Error Handling**: All tracking calls are wrapped in try-catch to prevent app crashes
4. **Development**: Tracking is enabled in development for testing with debug logs

## Viewing Analytics

1. Login to your Mixpanel dashboard
2. Navigate to "Events" to see real-time event tracking
3. Use "Insights" to create custom reports and funnels
4. Check "Users" to see user behavior patterns

## Development vs Production

- In development: Mixpanel debug mode is enabled for detailed logging
- In production: Only essential tracking data is sent
- All tracking is disabled if `NEXT_PUBLIC_MIXPANEL_TOKEN` is not set

## Common Patterns

### Track Feature Usage
```typescript
// When a user uses a specific feature
analytics.track('Feature Used', {
  feature: 'CSV Import',
  fileSize: '2.5MB',
  recordCount: 1500,
});
```

### Track Errors
```typescript
// When an error occurs
analytics.track('Error Occurred', {
  errorType: 'Network Error',
  errorMessage: error.message,
  context: 'Campaign Creation',
});
```

### Track Performance
```typescript
// Track loading times
const startTime = performance.now();
// ... operation ...
const endTime = performance.now();

analytics.track('Performance Metric', {
  operation: 'Dashboard Load',
  duration: endTime - startTime,
});
```
