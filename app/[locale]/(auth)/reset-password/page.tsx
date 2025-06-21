'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { account } from '@/lib/appwrite';



export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (password !== confirmPassword) {
    setMessage('Passwords do not match')
    return
  }

  if (!userId || !secret) {
    setMessage('Invalid reset link')
    return
  }

  setIsLoading(true)
  setMessage('')

  try {
    await account.updateRecovery(userId, secret, password)
    setMessage('Password reset successful! Redirecting...')
    setTimeout(() => router.push('/login'), 2000)
  } catch (error) {
    setMessage('Failed to reset password')
    console.error(error)
  } finally {
    setIsLoading(false)
  }
  }

  return (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Reset Password</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="p-3 rounded bg-gray-100 text-center">
        {message}
        </div>
      )}
      
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={isLoading}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
      </form>
    </CardContent>
    </Card>
  </div>
  )
}
