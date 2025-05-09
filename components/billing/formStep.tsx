"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  phone: z.string()
    .regex(/^\d{9}$/, "Le numéro doit contenir 9 chiffres"),
  smsCount: z.coerce.number()
    .min(8, "Vous devez recharger au minimum 8 SMS")
})

export type FormStepValues = z.infer<typeof formSchema>

interface FormStepProps {
  onSubmit: (values: FormStepValues) => Promise<void>
  loading?: boolean
}

export function FormStep({ onSubmit, loading = false }: FormStepProps) {
  const form = useForm<FormStepValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      smsCount: 100
    }
  })

  // Calculer le montant total (18 XAF par SMS)
  const smsCount = form.watch("smsCount") || 0
  const totalAmount = smsCount * 18

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">OM | MOMO</FormLabel>
                <FormControl>
                  <Input placeholder="691875974" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Nombre de SMS</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={8}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="py-2">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-center text-2xl font-semibold">{totalAmount} XAF</p>
              <p className="text-center text-xs text-muted-foreground">TTC (Taxe 3.5%): {(totalAmount * 1.035).toFixed(1)}</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-secondary-foreground"
            disabled={loading}
          >
            {loading ? "Traitement en cours..." : "Recharger"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-600/60 flex items-center justify-center">1</div>
          <div className="h-[2px] w-24 bg-muted-foreground" />
          <div className="h-8 w-8 rounded-full border border-muted-foreground text-muted-foreground flex items-center justify-center">2</div>
        </div>
      </div>
    </div>
  )
}