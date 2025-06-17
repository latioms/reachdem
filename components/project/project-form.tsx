"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Form, FormField, FormDescription, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, type ProjectInput } from "@/lib/validations/project"
import { createProject } from "@/app/actions/SMS/project/createProject"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProjectFormProps {
  onSuccess?: () => void;
  dictionary?: any;
}

export function ProjectForm({ onSuccess, dictionary }: ProjectFormProps): React.JSX.Element {
  const router = useRouter()
  const t = dictionary?.projects || {}

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      sender_name: "",
    },
  })

  async function onSubmit(values: ProjectInput) {
    await createProject(values.sender_name).then((res: any) => {
      if (res.error) {
        console.log(res.error)
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField          control={form.control}
          name="sender_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form?.projectName || "Veuillez entrer un nom de projet"}</FormLabel>
              <FormControl>
                <Input placeholder={t.form?.projectNamePlaceholder || "ReachDem"} {...field} />
              </FormControl>
              <FormDescription>{t.form?.projectNameDescription || "Il sera utilisé comme CODE EXPEDITEUR."}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{t.form?.createButtonLabel || "Créer un projet"}</Button>
      </form>
    </Form>
  )
}
