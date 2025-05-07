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
import { useState } from 'react'
import { TextTooltip } from '@/components/text-tooltip'

const formSchema = z.object({
  message: z.string().min(1, 'Le message est requis'),
  phones: z
    .string()
    .min(1, 'Veuillez entrer au moins un numéro')
    .refine(
      (val) => val.split(',').every(p => /^\+?[0-9\s-]+$/.test(p.trim())),
      { message: 'Un ou plusieurs numéros sont invalides' }
    )
})

type FormValues = z.infer<typeof formSchema>

export default function SMSForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      phones: '',
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const phones = data.phones.split(',').map(p => p.trim()).filter(Boolean)
      // Appel API pour chaque numéro
      const results = await Promise.all(
        phones.map(phone =>
          fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: 'ReachDem',
              phone,
              message: data.message,
            }),
          }).then(res => res.json())
        )
      )
      // Vérifie si une erreur est survenue
      if (results.some(r => r.error)) {
        setError(`Une ou plusieurs erreurs lors de l\'envoi.`)
      } else {
        setSuccess(true)
        form.reset()
      }
    } catch (e) {
      setError('Erreur lors de l\'envoi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-xl mx-auto p-6 space-y-6  rounded-xl shadow">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Entrez votre message ici..." {...field} />
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
                  <TextTooltip
                    text="Importer à partir d'un fichier Excel/CSV"
                    button={
                      <Paperclip className="absolute left-2 bottom-2 -rotate-45 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => alert("Paperclip clicked")} />
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer les messages'}
        </Button>

        {error && <div className="text-destructive text-center">{error}</div>}
        {success && <div className="text-primary text-center">Messages envoyés avec succès !</div>}

        <div className="flex justify-center pt-2 text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
        </div>
      </form>
    </Form>
  )
}
