'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import createSession from "@/app/actions/createSession"
import { useAuth } from "@/context/authContext"
import { trackAuthEvent } from "@/lib/tracking"
import Link from "next/link"

// Define schema for login form validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<LoginFormValues>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setIsAuthenticated, setCurrentUser } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (errors[name as keyof LoginFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formValues)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormValues> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginFormValues] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)    // Validate form inputs
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await createSession(formValues.email, formValues.password)
      
      if (result.success) {
        // Check auth status again to get the user
        const authCheck = await import("@/app/actions/chechAuth").then(mod => mod.default())
        if (authCheck.isAuthenticated && authCheck.user && 
            'id' in authCheck.user && 
            'email' in authCheck.user && 
            'ip' in authCheck.user && 
            'countryName' in authCheck.user) {
          setIsAuthenticated(true)
          setCurrentUser(authCheck.user)
          
          // Track successful login
          trackAuthEvent.login(authCheck.user.id, 'email')
          trackAuthEvent.loginAttempt(true)
          
          router.push("/dashboard") // Redirect to home or dashboard
        } else {
          setGeneralError("Authentication failed. Please try again.")
          trackAuthEvent.loginAttempt(false, "Authentication failed")
        }
      } else {
        setGeneralError("Invalid email or password. Please try again.")
        trackAuthEvent.loginAttempt(false, "Invalid credentials")
      }
    } catch (err) {
      setGeneralError("An error occurred. Please try again later.")
      trackAuthEvent.loginAttempt(false, "Network error")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {generalError && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {generalError}
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formValues.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  value={formValues.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <Button variant="outline" className="w-full" type="button" disabled={isLoading}>
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href={`register`}>
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
