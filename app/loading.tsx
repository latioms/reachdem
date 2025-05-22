'use client'
import { PageLoader } from '@/components/ui/loader'
import { useEffect, useState } from 'react'

export default function RootLoading() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide loader after a minimum display time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // 1 second minimum display time

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null
  return <PageLoader />
}
