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

  const onSubmit = (data: FormValues) => {
    console.log('Envoi des messages avec:', data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow">
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
                  <Input placeholder="+2376XXXXXXX, +2376YYYYYYY" {...field} className="pl-8" />
                  <Paperclip className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">Importer via csv ou fichiers Excel</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-black text-white">
          Envoyer les messages
        </Button>

        <div className="flex justify-center pt-2 text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
        </div>
      </form>
    </Form>
  )
}
