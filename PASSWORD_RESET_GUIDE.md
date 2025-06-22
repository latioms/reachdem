# Password Reset Workflow

This project now supports resetting passwords via email using Appwrite and Resend.

## Requesting a reset
1. Navigate to `/forgot-password` from the login page.
2. Enter the email associated with your account.
3. You will receive an email with a link to create a new password.

## Completing the reset
1. Click the link in the email. You will be taken to the `/reset-password` page with a `userId` and `secret` query.
2. Choose a new password and submit the form.

## Implementation notes
- We use `account.createRecovery` and `account.updateRecovery` from the Appwrite SDK.
- Emails are sent through Resend using the React template in `emails/password-reset.tsx`.
- Update `NEXT_PUBLIC_APP_URL` and `RESEND_API_KEY` in your environment for local testing.
