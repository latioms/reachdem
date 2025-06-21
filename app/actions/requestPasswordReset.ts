'use server'
import { account } from '@/lib/appwrite'
import { sendPasswordResetEmail } from '@/lib/notifications'

export default async function requestPasswordReset(email: string, locale: string = 'en') {
  try {
    const token = await account.createRecovery(email, `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/reset-password`)
    if (token && token.userId && token.secret) {
      await sendPasswordResetEmail(email, token.userId, token.secret)
    }
    return { success: true }} catch (error: unknown) {
    console.error('Error requesting password reset:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to request password reset'
    return { success: false, error: errorMessage }
  }
}
