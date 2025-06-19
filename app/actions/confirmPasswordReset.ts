'use server'
import { account } from '@/lib/appwrite'

export default async function confirmPasswordReset(userId: string, secret: string, password: string) {
  try {
    await account.updateRecovery(userId, secret, password)
    return { success: true }
  } catch (error: any) {
    console.error('Error confirming password reset:', error)
    return { success: false, error: error.message || 'Failed to reset password' }
  }
}
