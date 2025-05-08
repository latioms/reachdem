"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormStep, type FormStepValues } from "./formStep"
import { StatusStep } from "./statusStep"
import { initPayment } from "@/app/actions/payment"
import { useAuth } from "@/context/authContext"
import { usePaymentStore } from "@/store/payment-store"
export function RechargeModal() {
  const router = useRouter() // Initialize useRouter
  const { currentUser } = useAuth()
  const { 
    setReference, 
    setTransactionId, // Assuming you might want to store this too
    setAmount: storeAmount, 
    setPhone: storePhone, 
    setStatus: storeStatus,
    setError: storeError,
  } = usePaymentStore() // Get setters from Zustand store

  const [currentStep, setCurrentStep] = useState<"form" | "status">("form")
  const [loading, setLoading] = useState(false)
  const [transactionData, setTransactionData] = useState<{
    reference?: string;
    amount?: number;
    phone?: string;
  }>({})
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: FormStepValues) {
    setLoading(true)
    setError(null)
    storeError(null) // Clear previous store errors

    if (!currentUser?.email) {
      const msg = "Impossible de récupérer l\\'email de l\\'utilisateur. Veuillez vous reconnecter."
      setError(msg)
      storeError(msg)
      setLoading(false)
      return
    }

    const amount = data.smsCount * 19 // 19 FCFA per SMS credit
    const payerPhone = data.phone

    try {
      // 1. Initialize Payment
      const initData = await initPayment(currentUser.email, amount)

      if (!initData || !initData.transaction || !initData.transaction.reference) {
        const msg = initData?.message || "Erreur lors de l\\'initialisation du paiement. Aucune référence de transaction reçue."
        throw new Error(msg)
      }
      const paymentReference = initData.transaction.reference
      // const transactionId = initData.transaction.trxref || initData.transaction.merchant_reference; // Example if you need it

      console.log("Payment initialized:", initData)

      // Store essential info in Zustand before charging and redirecting
      setReference(paymentReference)
      // if (transactionId) setTransactionId(transactionId);
      storeAmount(amount)
      storePhone(payerPhone)
      storeStatus("pending") // Set initial status to pending

      // 2. Charge Payment
      const chargeResponse = await fetch("/api/notchpay/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: paymentReference,
          channel: "cm.mobile", // Assuming "cm.mobile"
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
      
      // Update local state for the brief StatusStep display in modal
      setTransactionData({
        reference: paymentReference,
        amount: amount,
        phone: payerPhone,
      })
      setCurrentStep("status") // Show "confirm on phone" message

      // Redirect to the polling status page after a short delay
      setTimeout(() => {
      }, 2000) // 2-second delay to show the message, then redirect

    } catch (err) {
      console.error("Payment process error:", err)
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue."
      setError(errorMessage)
      storeError(errorMessage)
      storeStatus("failed") // Update store status on error
    } 
  }

  // This handler is for a potential close/cancel button on the StatusStep within the modal
  // if the redirect hadn't happened yet. Current StatusStep doesn't have it.
  const handleCloseStatusInModal = () => {
    setCurrentStep("form");
    setTransactionData({});
    setError(null);
    setLoading(false); // Ensure loading is false if returning to form
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
          // onClose={handleCloseStatusInModal} // StatusStep would need a button to trigger this
        />
      )}
    </DialogContent>
  )
}