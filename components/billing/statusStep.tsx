"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/store/payment-store"
import { CheckCircle } from "lucide-react"
import { useEffect } from "react"

interface StatusStepProps {
  reference?: string
  amount?: number
  phone?: string
  onClose?: () => void
}

export function StatusStep({ reference, amount, phone, onClose }: StatusStepProps) {
  const { status, setStatus } = usePaymentStore()
  const isCompleted = status === "complete"

  useEffect(() => {
    if (!reference || isCompleted) return

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/notchpay/status?reference=${reference}`)
        const data = await response.json()
        
        if (response.ok) {
          if (data.transaction.status === "complete" ) {
            setStatus("complete")
          } else if (data.transaction.status === "failed" ) {
            setStatus("failed")
          }
          // Autres statuts restent en "processing" ou "pending"
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut:", error)
      }
    }

    // Premier check immédiat
    checkStatus()

    // Mettre en place le polling toutes les 3 secondes
    const intervalId = setInterval(checkStatus, 3000)

    // Cleanup à la destruction du composant
    return () => {
      clearInterval(intervalId)
    }
  }, [reference, isCompleted, setStatus])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mb-4">
          {isCompleted ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
          )}
        </div>
        <h3 className="text-lg font-semibold">
          {isCompleted 
            ? "Paiement effectué avec succès" 
            : status === "failed"
            ? "Le paiement a échoué"
            : "Veuillez confirmer le paiement sur votre téléphone"}
        </h3>
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
          <div className="h-8 w-8 rounded-full bg-green-500/55 border border-muted-foreground text-muted-foreground flex items-center justify-center">1</div>
          <div className="h-[2px] w-24 bg-muted-foreground" />
          <div className={`h-8 w-8 rounded-full ${isCompleted ? 'bg-green-500/55' : 'bg-yellow-600/60'} flex items-center justify-center`}>2</div>
        </div>
      </div>
    </div>
  )
}