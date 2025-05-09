"use client"

import { useEffect, useState } from 'react'
import { getProjects } from '@/app/actions/project/getProjects'
import type { Project } from '@/types/schema'

export function useUserProjects(userId: string | undefined) {
  const [data, setData] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const result = await getProjects()
        if (result.error) {
          setError(result.error)
        } else if (result.projects) {
          setData(result.projects)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [userId])

  return { data, isLoading, error }
}