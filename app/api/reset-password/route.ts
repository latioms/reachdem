import { NextRequest, NextResponse } from 'next/server'
import { account } from '@/lib/appwrite'

export async function POST(request: NextRequest) {
  try {
    const { userId, secret, password } = await request.json()

    if (!userId || !secret || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Complete the password recovery using Appwrite
    await account.updateRecovery(userId, secret, password)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error: unknown) {
    console.error('Password reset error:', error)
    
    // Handle specific Appwrite errors
    let errorMessage = 'Failed to reset password'
    let statusCode = 500
    
    if (error && typeof error === 'object' && 'code' in error) {
      const appwriteError = error as { code: number; message?: string }
      statusCode = appwriteError.code
      
      if (appwriteError.code === 401) {
        errorMessage = 'Invalid or expired reset link'
      } else if (appwriteError.code === 400) {
        errorMessage = 'Invalid request. Please check your input.'
      } else if (appwriteError.message) {
        errorMessage = appwriteError.message
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}
