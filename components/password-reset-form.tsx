'use client'
import { useState } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSearchParams, useRouter } from 'next/navigation'
import confirmPasswordReset from '@/app/actions/confirmPasswordReset'
import { toast } from 'sonner'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})

export default function PasswordResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const userId = params.get('userId')
  const secret = params.get('secret')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      schema.parse({ password, confirmPassword })
      setErrors({})
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: any = {}
        err.errors.forEach(er => {
          if (er.path[0]) newErrors[er.path[0]] = er.message
        })
        setErrors(newErrors)
      }
      return
    }

    if (!userId || !secret) {
      toast.error('Invalid reset link')
      return
    }

    setIsLoading(true)
    const res = await confirmPasswordReset(userId, secret, password)
    setIsLoading(false)
    if (res.success) {
      toast.success('Password updated')
      router.push('/login')
    } else {
      toast.error(res.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Reset password'}
      </Button>
    </form>
  )
}
