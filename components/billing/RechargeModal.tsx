"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormStep, type FormStepValues } from "./formStep"
import { StatusStep } from "./statusStep"
import { initPayment } from "@/app/actions/payment"
import { useAuth } from "@/context/authContext"
import { usePaymentStore } from "@/store/payment-store"

interface RechargeModalProps {
  projectId: string;
}

export function RechargeModal({ projectId }: RechargeModalProps) {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { 
    setReference, 
    setTransactionId,
    setAmount: storeAmount, 
    setPhone: storePhone, 
    setStatus: storeStatus,
    setError: storeError,
  } = usePaymentStore()

  const [currentStep, setCurrentStep] = useState<"form" | "status">("form")
  const [loading, setLoading] = useState(false)
  const [transactionData, setTransactionData] = useState<{
    reference?: string;
    amount?: number;
    phone?: string;
    smsCount?: number;
  }>({})
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: FormStepValues) {
    setLoading(true)
    setError(null)
    storeError(null)

    if (!currentUser?.email) {
      const msg = "Impossible de récupérer l\\'email de l\\'utilisateur. Veuillez vous reconnecter."
      setError(msg)
      storeError(msg)
      setLoading(false)
      return
    }

    const amount = data.smsCount * 18
    const payerPhone = data.phone

    try {
      const initData = await initPayment(currentUser.email, amount)

      if (!initData || !initData.transaction || !initData.transaction.reference) {
        const msg = initData?.message || "Erreur lors de l\\'initialisation du paiement. Aucune référence de transaction reçue."
        throw new Error(msg)
      }
      const paymentReference = initData.transaction.reference

      console.log("Payment initialized:", initData)

      setReference(paymentReference)
      storeAmount(amount)
      storePhone(payerPhone)
      storeStatus("pending")

      const chargeResponse = await fetch("/api/notchpay/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: paymentReference,
          channel: "cm.mobile",
          phone: payerPhone,
        }),
      })

      if (!chargeResponse.ok) {
        const errorData = await chargeResponse.json().catch(() => null)
        const msg = errorData?.message || errorData?.error || `Erreur ${chargeResponse.status} lors du débit du paiement.`
        throw new Error(msg)
      }

      const chargeData = await chargeResponse.json()
      console.log("Payment charged (or charge initiated):", chargeData)
      
      setTransactionData({
        reference: paymentReference,
        amount: amount,
        phone: payerPhone,
        smsCount: data.smsCount
      })
      setCurrentStep("status")

      setTimeout(() => {
      }, 2000)

    } catch (err) {
      console.error("Payment process error:", err)
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue."
      setError(errorMessage)
      storeError(errorMessage)
      storeStatus("failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseStatusInModal = () => {
    setCurrentStep("form");
    setTransactionData({});
    setError(null);
    setLoading(false);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Recharger vos crédits</DialogTitle>
        <DialogDescription>
          {currentStep === "form"
            ? "Entrez votre numéro de téléphone et le nombre de SMS à recharger."
            : transactionData.reference 
            ? "Confirmation du paiement en cours, Veuillez valider sur votre téléphone et gardez l'onglet ouvert."
            : "Chargement..."}
          {error && currentStep === "form" && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </DialogDescription>
      </DialogHeader>

      {currentStep === "form" ? (
        <FormStep onSubmit={handleSubmit} loading={loading} />
      ) : (
        <StatusStep 
          reference={transactionData.reference} 
          amount={transactionData.amount} 
          phone={transactionData.phone}
          projectId={projectId}
          smsCount={transactionData.smsCount!}
        />
      )}
    </DialogContent>
  )
}