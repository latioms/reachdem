"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Form, FormField, FormDescription, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, type ProjectInput } from "@/lib/validations/project"
import { createProject } from "@/app/actions/project/createProject"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ProjectForm({ onSuccess }: { onSuccess?: () => void }): React.JSX.Element {
  const router = useRouter()

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
        <FormField
          control={form.control}
          name="sender_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veuillez entrer un nom de projet</FormLabel>
              <FormControl>
                <Input placeholder="ReachDem" {...field} />
              </FormControl>
              <FormDescription>Il sera utilisé comme CODE EXPEDITEUR.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Créer un projet</Button>
      </form>
    </Form>
  )
}
