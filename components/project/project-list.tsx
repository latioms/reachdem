"use client"

import { useRouter } from "next/navigation"
import type { Project } from "@/types/schema"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "../ui/label"

interface ProjectListProps {
  projects: Project[];
  dictionary?: any;
}

export function ProjectList({ projects, dictionary }: ProjectListProps) {
  const router = useRouter()
  const t = dictionary?.projects || {}
  return (
    <div className="space-y-5 h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t.title || "Vos projets"}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>{project.sender_name}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {t.card?.senderCode || "Code expéditeur"}
                </span>
                <Label className={`rounded-full ${project.sms_credits <= 10 ? `bg-destructive` : 'bg-foreground'}  p-1 text-muted`}>
                  {project.sms_credits}
                </Label>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>ID: {project.id}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push(`/dashboard?project=${project.id}`)}>
                {t.details || "Voir les détails"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
