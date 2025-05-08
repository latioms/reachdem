"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatusStepProps {
  reference?: string
  amount?: number
  phone?: string
  onClose?: () => void
}

export function StatusStep({ reference, amount, phone, onClose }: StatusStepProps) {
  return (
    <div className="space-y-6">

      <div className="text-center space-y-4">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
        </div>
        <h3 className="text-lg font-semibold">Veuillez confirmer le paiement sur votre téléphone</h3>
      </div>

      <div className="rounded-lg bg-muted/30 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Référence:</span>
          <span className="font-medium">{reference}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Montant:</span>
          <span className="font-medium">{amount} XAF</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Téléphone:</span>
          <span className="font-medium">{phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-600/60 border border-muted-foreground text-muted-foreground flex items-center justify-center">1</div>
          <div className="h-[2px] w-24 bg-muted-foreground" />
          <div className="h-8 w-8 rounded-full bg-yellow-600/60 flex items-center justify-center">2</div>
        </div>
      </div>
    </div>
  )
}