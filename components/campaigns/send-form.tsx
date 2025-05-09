'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Paperclip, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { TextTooltip } from '@/components/text-tooltip'
import { sendSMSAction } from '@/app/actions/send/sendSMS'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUserProjects } from '@/hooks/use-projects'
import { useAuth } from '@/context/authContext'
import { storeMessage } from '@/app/actions/messages/storeMessage'
import { decreaseSMSCredit } from '@/app/actions/project/credit'
import { toast } from 'sonner'
import { Label } from '../ui/label'

const formSchema = z.object({
  message: z.string().min(1, 'Le message est requis').max(160, 'Le message ne doit pas dépasser 160 caractères'),
  phones: z
    .string()
    .min(1, 'Veuillez entrer au moins un numéro')
    .refine(
      (val) => val.split(',').every(p => /^\+?[0-9\s-]+$/.test(p.trim())),
      { message: 'Un ou plusieurs numéros sont invalides' }
    ),
  projectId: z.string().min(1, 'Veuillez sélectionner un projet')
})

type FormValues = z.infer<typeof formSchema>

export default function SMSForm() {
  const { currentUser } = useAuth()
  const { data: projects, isLoading: projectsLoading } = useUserProjects(currentUser?.id)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      phones: '',
      projectId: '',
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [shakeProgress, setShakeProgress] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Si l'utilisateur tente de dépasser 160 caractères
    if (value.length > 160) {
      setShakeProgress(true);
      setShowError(true);
      setTimeout(() => {
        setShakeProgress(false);
        setShowError(false);
      }, 500);
    }

    // Toujours mettre à jour le champ avec les 160 premiers caractères
    form.setValue('message', value.slice(0, 160));
  }

  const onSubmit = async (data: FormValues) => {
    const phones = data.phones.split(',').map(p => p.trim()).filter(Boolean)
    const selectedProject = projects?.find(p => p.id === data.projectId)

    if (!selectedProject?.sender_name) {
      toast.error('Nom d\'expéditeur non trouvé pour ce projet')
      return
    }

    // Vérifier si le projet a suffisamment de crédits
    if (!selectedProject.sms_credits || selectedProject.sms_credits < phones.length) {
      toast.error(
        `Crédits SMS insuffisants. Il vous faut ${phones.length} crédit${phones.length > 1 ? 's' : ''}, 
        mais il vous reste ${selectedProject.sms_credits || 0} crédit${selectedProject.sms_credits !== 1 ? 's' : ''}.`
      )
      return
    }

    await toast.promise(
      Promise.all(
        phones.map(async (phone) => {
          const smsResp = await sendSMSAction(selectedProject.sender_name, data.message, phone)
          await decreaseSMSCredit(selectedProject.id, 1)
          await storeMessage(currentUser?.id!, data.message, phone, smsResp?.response?.message)
          return smsResp
        })
      ),
      {
        loading: 'Envoi des messages en cours...',
        success: (results) => {
          form.reset()
          return 'Messages envoyés avec succès !'
        },
        error: 'Une erreur est survenue lors de l\'envoi'
      }
    )
  }

  // Afficher les crédits disponibles pour le projet sélectionné
  const selectedProject = projects?.find(p => p.id === form.watch('projectId'))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-xl mx-auto p-6 space-y-6 rounded-xl shadow">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projet</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un projet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.sender_name} <Label className='px-2 py-1 bg-gray-400 text-black rounded-full'>{project.sms_credits || 0}</Label>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Entrez votre message ici..." 
                    onChange={handleMessageChange}
                    value={field.value}
                  />
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mr-4">
                      <div
                        className={`h-full transition-colors ${shakeProgress ? 'animate-shake' : ''} ${showError ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ 
                          width: `${Math.min((field.value.length / 160) * 100, 100)}%`,
                          transform: 'translate3d(0, 0, 0)',
                          backfaceVisibility: 'hidden',
                          perspective: '1000px'
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap">
                      {field.value.length}/160 caractères
                    </span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéros de téléphone (séparés par des virgules)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea placeholder="+2376XXXXXXX, +2376YYYYYYY" {...field} className="pl-4" />
                  {/* <TextTooltip
                    text="Importer à partir d'un fichier Excel/CSV"
                    button={
                      <Paperclip className="absolute left-2 bottom-2 -rotate-45 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => alert("Paperclip clicked")} />
                    }
                  /> */}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading || selectedProject?.active !== 'enabled'}>
          {loading ? 'Envoi en cours...' : 'Envoyer les messages'}
        </Button>

        {selectedProject && selectedProject?.active !== 'enabled' && 
          <div className="text-destructive text-center text-sm">
            Ce projet est désactivé. Contactez le service client pour en savoir plus.
          </div>
        }

        {error && <div className="text-destructive text-center">{error}</div>}
        {success && <div className="text-primary text-center">Messages envoyés avec succès !</div>}
      </form>
    </Form>
  )
}
