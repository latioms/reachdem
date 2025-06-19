'use server'
import { account } from '@/lib/appwrite'
import { sendPasswordResetEmail } from '@/lib/notifications'

export default async function requestPasswordReset(email: string) {
  try {
    const token = await account.createRecovery(email, `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`)
    if (token && token.userId && token.secret) {
      await sendPasswordResetEmail(email, token.userId, token.secret)
    }
    return { success: true }
  } catch (error: any) {
    console.error('Error requesting password reset:', error)
    return { success: false, error: error.message || 'Failed to request password reset' }
  }
}
