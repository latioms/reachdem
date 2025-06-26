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
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { sendSMSAction } from '@/app/actions/SMS/send/sendSMS'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUserProjects } from '@/hooks/use-projects'
import { useAuth } from '@/context/authContext'
import { storeMessage } from '@/app/actions/SMS/messages/storeMessage'
import { decreaseSMSCredit } from '@/app/actions/SMS/project/credit'
import { toast } from 'sonner'
import { Label } from '../ui/label'

interface SendFormProps {
  dictionary?: any;
}

export default function SMSForm({ dictionary }: SendFormProps) {
  // Use dictionary with fallback texts
  const t = dictionary || {
    form: {
      project: "Projet",
      selectProject: "Sélectionnez un projet",
      message: "Message",
      messagePlaceholder: "Entrez votre message ici...",
      charactersCount: "caractères",
      phones: "Numéros de téléphone (séparés par des virgules)",
      phonesPlaceholder: "+2376XXXXXXX, +2376YYYYYYY",
      importFromFile: "Importer à partir d'un fichier Excel/CSV",
      submit: "Envoyer les messages",
      sending: "Envoi en cours...",
      projectDisabled: "Ce projet est désactivé. Contactez le service client pour en savoir plus."
    },
    toast: {
      senderNotFound: "Nom d'expéditeur non trouvé pour ce projet",
      insufficientCredits: "Crédits SMS insuffisants. Il vous faut {count} crédit(s), mais il vous reste {available} crédit(s).",
      sending: "Envoi des messages en cours...",
      success: "Messages envoyés avec succès !",
      error: "Une erreur est survenue lors de l'envoi"
    },
    validation: {
      messageRequired: "Le message est requis",
      messageMaxLength: "Le message ne doit pas dépasser 160 caractères",
      phonesRequired: "Veuillez entrer au moins un numéro",
      phonesInvalid: "Un ou plusieurs numéros sont invalides",
      projectRequired: "Veuillez sélectionner un projet"
    }
  };

  const formSchema = z.object({
    message: z.string()
      .min(1, t.validation.messageRequired)
      .max(160, t.validation.messageMaxLength),
    phones: z
      .string()
      .min(1, t.validation.phonesRequired)
      .refine(
        (val) => val.split(',').every(p => /^\+?[0-9\s-]+$/.test(p.trim())),
        { message: t.validation.phonesInvalid }
      ),
    projectId: z.string().min(1, t.validation.projectRequired)
  });

  const { currentUser } = useAuth()
  const { data: projects, isLoading: projectsLoading } = useUserProjects(currentUser?.id)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      phones: '',
      projectId: '',
    },
  })

  const [loading, ] = useState(false)
  const [error, ] = useState<string | null>(null)
  const [success, ] = useState(false)
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const phones = data.phones.split(',').map(p => p.trim()).filter(Boolean)
    const selectedProject = projects?.find(p => p.id === data.projectId)

    if (!selectedProject?.sender_name) {
      toast.error(t.toast.senderNotFound)
      return
    }

    // Vérifier si le projet a suffisamment de crédits
    if (!selectedProject.sms_credits || selectedProject.sms_credits < phones.length) {
      const creditsMessage = t.toast.insufficientCredits
        .replace('{count}', String(phones.length))
        .replace('{available}', String(selectedProject.sms_credits || 0));
      
      toast.error(creditsMessage)
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
        loading: t.toast.sending,
        success: (results) => {
          form.reset()
          return t.toast.success
        },
        error: t.toast.error
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
              <FormLabel>{t.form.project}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.form.selectProject} />
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
              <FormLabel>{t.form.message}</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Textarea 
                    placeholder={t.form.messagePlaceholder} 
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
                      {field.value.length}/160 {t.form.charactersCount}
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
              <FormLabel>{t.form.phones}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea placeholder={t.form.phonesPlaceholder} {...field} className="pl-4" />
                  {/* <TextTooltip
                    text={t.form.importFromFile}
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
          {loading ? t.form.sending : t.form.submit}
        </Button>

        {selectedProject && selectedProject?.active !== 'enabled' && 
          <div className="text-destructive text-center text-sm">
            {t.form.projectDisabled}
          </div>
        }

        {error && <div className="text-destructive text-center">{error}</div>}
        {success && <div className="text-primary text-center">{t.toast.success}</div>}
      </form>
    </Form>
  )
}
