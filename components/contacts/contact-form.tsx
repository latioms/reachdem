"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Form, FormField, FormDescription, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, type ContactInput } from "@/lib/validations/contact"
import { addContact } from "@/app/actions/mail/contacts/addContact"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, UserCheck } from "lucide-react"

interface ContactFormProps {
  onSuccess?: () => void;
  dictionary?: any;
}

export function ContactForm({ onSuccess, dictionary }: ContactFormProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = dictionary?.contacts || {}
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  async function onSubmit(values: ContactInput) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await addContact(values)
      
      if (result.error) {
        setError(result.error)
        return
      }

      // Reset form on success
      form.reset()

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          {t.form?.title || "Ajouter un nouveau contact"}
        </CardTitle>        <CardDescription>
          {t.form?.description || "Remplissez les informations du contact. Seul l'email est obligatoire."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.form?.firstName || "Prénom"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.form?.firstNamePlaceholder || "John"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.form?.lastName || "Nom"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.form?.lastNamePlaceholder || "Doe"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t.form?.email || "Email"} *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder={t.form?.emailPlaceholder || "john@example.com"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t.form?.phone || "Téléphone"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.form?.phonePlaceholder || "+33 1 23 45 67 89"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.form?.address || "Adresse"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.form?.addressPlaceholder || "123 Rue de la Paix, 75001 Paris"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {t.form?.creating || "Création..."}
                  </>
                ) : (
                  t.form?.createButton || "Ajouter le contact"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                {t.form?.resetButton || "Réinitialiser"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
