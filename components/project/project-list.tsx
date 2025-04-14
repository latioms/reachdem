"use client"

import { useRouter } from "next/navigation"
import type { Project } from "@/types/schema"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter()

  return (
    <div className="space-y-5 h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Vos projets</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>{project.sender_name}</CardTitle>
              <CardDescription>Code expéditeur</CardDescription>
            </CardHeader>
            <CardContent>
              <p>ID: {project.id}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push(`/dashboard?project=${project.id}`)}>
                Voir les détails
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
