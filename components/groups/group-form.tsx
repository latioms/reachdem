"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormField, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { UsersRound, Info, Loader2 } from "lucide-react"

// Définition du schéma de validation pour un groupe
export const groupSchema = z.object({
  name: z.string().min(1, "Le nom du groupe est requis"),
  description: z.string().optional(),
});

export type GroupInput = z.infer<typeof groupSchema>;

interface GroupFormProps {
  onSuccess?: () => void;
  dictionary?: any;
  group?: GroupInput & { id?: string }; // Pour l'édition
}

export function GroupForm({ onSuccess, dictionary, group }: GroupFormProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = dictionary?.groups || {}
  const isEditing = Boolean(group?.id)
  
  const form = useForm<GroupInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
    },
  })

  async function onSubmit(values: GroupInput) {
    setIsLoading(true)
    setError(null)

    try {
      // Importer dynamiquement la fonction d'ajout de groupe
      const { addGroup } = await import('@/app/actions/mail/groups/addGroup');
      
      // Appeler la fonction d'action serveur
      const result = await addGroup({
        name: values.name,
        description: values.description
      });
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      console.log("Groupe créé avec succès:", result);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Actualiser l'UI
      router.refresh()
    } catch (err) {
      console.error("Erreur lors de la soumission du groupe:", err)
      setError("Une erreur s'est produite lors de l'enregistrement du groupe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Nom du groupe */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UsersRound className="h-4 w-4" />
                      {t.name || "Nom du groupe"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.name || "Nom du groupe"}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      {t.descriptionField || "Description"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.descriptionField || "Description du groupe"}
                        className="resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <CardFooter className="px-0 flex justify-end gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing 
                  ? (t.editGroup || "Mettre à jour le groupe") 
                  : (t.createGroup || "Créer le groupe")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
