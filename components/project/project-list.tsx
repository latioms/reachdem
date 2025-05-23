"use client"

import { useRouter } from "next/navigation"
import type { Project } from "@/types/schema"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "../ui/label"
import { QRCodeModal } from "@/components/ui/qrcode-modal"
import { MessageCircle } from "lucide-react"

interface ProjectListProps {
  projects: Project[];
  dictionary?: any;
}

export function ProjectList({ projects, dictionary }: ProjectListProps) {
  const router = useRouter()
  const t = dictionary?.projects || {}

  // Fonction pour générer l'URL WhatsApp avec message pré-rempli
  const generateWhatsAppURL = (project: Project) => {
    const phoneNumber = "+237233472836"
    const message = `Bonjour, je souhaite activer mon projet "${project.sender_name}" (ID: ${project.id}). Merci de procéder à la vérification anti-phishing.`
    const encodedMessage = encodeURIComponent(message)
    return `https://api.whatsapp.com/send/?phone=${encodeURIComponent(phoneNumber)}&text=${encodedMessage}&type=phone_number&app_absent=0`
  }

  const generateDisplayURL = (project: Project) => {
    return `WhatsApp: +237 233 472 836\nProjet: ${project.sender_name} (${project.id})`
  }
  return (
    <div className="space-y-5 h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t.title || "Vos projets"}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
                <CardTitle className={project.active === 'disabled' ? 'text-destructive' : project.active === 'pending' ? 'text-orange-500' : ''}>{project.sender_name}</CardTitle>
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
            </CardContent>            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/dashboard?project=${project.id}`)}
                className="flex-1"
              >
                {t.details || "Voir les détails"}
              </Button>
              {project.active !== 'enabled' && (
              <QRCodeModal
                qrData={generateWhatsAppURL(project)}
                displayUrl={generateDisplayURL(project)}
                trigger={
                  <Button variant="outline" size="sm" className="shrink-0">
                    Activer <MessageCircle className="h-4 w-4" />
                  </Button>
                }
                title="Contact WhatsApp"
                description="Scannez ce QR code pour nous contacter via WhatsApp et activer votre projet"
              >
                <div className="w-full pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous serez invité à fournir des informations supplémentaires pour activer votre projet.
                  </p>
                </div>
              </QRCodeModal>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
