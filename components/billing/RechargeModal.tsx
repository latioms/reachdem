"use client"

import { useState } from "react"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormStep, type FormStepValues } from "./formStep"
import { StatusStep } from "./statusStep"

export function RechargeModal() {
  const [currentStep, setCurrentStep] = useState<"form" | "status">("form")
  const [loading, setLoading] = useState(false)
  const [transactionData, setTransactionData] = useState<{
    reference?: string;
    amount?: number;
    phone?: string;
  }>({})

  async function handleSubmit(data: FormStepValues) {
    setLoading(true)
    try {
      // Simuler une création de transaction - à remplacer par votre logique réelle
      const mockTransaction = {
        reference: "trx." + Math.random().toString(36).substring(2),
        amount: data.smsCount * 19, // 19 FCFA par crédit par exemple
        phone: data.phone
      }
      
      setTransactionData(mockTransaction)
      setCurrentStep("status")
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Recharger vos crédits</DialogTitle>
        <DialogDescription>
          {currentStep === "form" 
            ? "Entrez votre numéro de téléphone et le montant à recharger."
            : "Confirmation du paiement en cours..."
          }
        </DialogDescription>
      </DialogHeader>

      {currentStep === "form" ? (
        <FormStep onSubmit={handleSubmit} loading={loading} />
      ) : (
        <StatusStep {...transactionData} />
      )}
    </DialogContent>
  )
}