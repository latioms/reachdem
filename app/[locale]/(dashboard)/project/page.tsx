"use client"

import { useState, useEffect } from "react"
import { getProjects } from "@/app/actions/getProjects"
import type { Project } from "@/types/schema"
import { ProjectForm } from "@/components/project/project-form"
import { ProjectList } from "@/components/project/project-list"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export default function ProjectPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const result = await getProjects()
        if (result.success) {
          setProjects(result.projects)
          // Ouvrir automatiquement le dialogue seulement s'il n'y a pas de projets
          setDialogOpen(result.projects.length === 0)
        } else {
          console.error("Error fetching projects:", result.error)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [refreshTrigger])

  const handleProjectCreated = async () => {
    setRefreshTrigger((prev) => prev + 1) // Déclenche un nouveau fetchProjects
    setDialogOpen(false) // Fermer la boîte de dialogue après la création
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des projets...</span>
      </div>
    )
  }

  // Afficher uniquement le Dialog OU la liste des projets, jamais les deux ensemble
  return (
    <div className="container mx-auto py-8">
      {projects.length === 0 ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogTitle>Créer un projet</DialogTitle>
            <DialogDescription>Vous devez créer un projet pour démarrer.</DialogDescription>
            <ProjectForm onSuccess={handleProjectCreated} />
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mb-6">
                Créer un projet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Créer un projet</DialogTitle>
              <DialogDescription>Créez un nouveau projet pour gérer vos campagnes.</DialogDescription>
              <ProjectForm onSuccess={handleProjectCreated} />
            </DialogContent>
          </Dialog>

          <ProjectList projects={projects} />
        </>
      )}
    </div>
  )
}
