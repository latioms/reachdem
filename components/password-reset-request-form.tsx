'use client'
import { useState } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import requestPasswordReset from '@/app/actions/requestPasswordReset'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { useDualTracking } from '@/hooks/use-dual-analytics'

const schema = z.object({ email: z.string().email() })

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || 'en'
  const { trackAuthEvent, trackFormEvent } = useDualTracking()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      schema.parse({ email })
      setError(null)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message)
      }
      return
    }    setIsLoading(true)
    const res = await requestPasswordReset(email, locale)
    setIsLoading(false)
    
    if (res.success) {
      toast.success('Password reset email sent')
      trackAuthEvent.loginAttempt(true, 'password_reset_requested')
      trackFormEvent.submit('password-reset-request', true, { email })
      router.push('/login')
    } else {
      toast.error(res.error)
      trackAuthEvent.loginAttempt(false, res.error || 'password_reset_request_failed')
      trackFormEvent.submit('password-reset-request', false, { email }, res.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  )
}
