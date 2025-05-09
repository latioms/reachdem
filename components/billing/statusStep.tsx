"use client"

import { usePaymentStore } from "@/store/payment-store"
import { CheckCircle } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/context/authContext"
import { increaseSMSCredit } from "@/app/actions/project/credit"
import { sendEmailReceipt } from "@/lib/notifications"
import { sendSMS } from "@/lib/sms"
import { createTransaction } from "@/app/actions/transactions/createTransaction"
import { updateTransaction } from "@/app/actions/transactions/updateTransaction"

interface StatusStepProps {
  reference?: string
  amount?: number
  phone?: string
  onClose?: () => void
  projectId: string
  smsCount: number
}

export function StatusStep({ 
  reference, 
  amount, 
  phone, 
  onClose,
  projectId,
  smsCount 
}: StatusStepProps) {  const { status, setStatus, transactionId } = usePaymentStore()
  const { currentUser } = useAuth()
  const isCompleted = status === "complete"

  useEffect(() => {
    if (!reference || !currentUser) return

    if (isCompleted) {
      // When payment is completed, increase credits and send notifications
      handlePaymentSuccess()
      return
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/notchpay/status?reference=${reference}`)
        const data = await response.json()
          if (response.ok) {
          if (data.transaction.status === "complete") {
            setStatus("complete")
          } else if (data.transaction.status === "failed" || data.transaction.status === "canceled") {
            setStatus("failed")
            // Mettre à jour le statut de la transaction en cas d'échec
            if (transactionId) {
              updateTransaction({
                id: transactionId,
                status: 'failed'
              });
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut:", error)
      }
    }

    checkStatus()
    const intervalId = setInterval(checkStatus, 3000)
    return () => clearInterval(intervalId)
  }, [reference, isCompleted, setStatus, currentUser, projectId, smsCount, amount, phone])
  const handlePaymentSuccess = async () => {
    try {
      // Mettre à jour le statut de la transaction si l'ID est disponible
      if (transactionId) {
        await updateTransaction({
          id: transactionId,
          status: 'success'
        });
      }
      
      // Increase SMS credits
      await increaseSMSCredit(projectId, smsCount)

      // Send notifications
      if (currentUser?.email && amount) {
        await sendEmailReceipt(currentUser.email, reference!, amount)
      }
      
      if (phone && amount) {
        await sendSMS(
          'ReachDem',
          `Votre paiement de ${amount} XAF a été reçu avec succès. Merci!`,
          phone
        )
      }
    } catch (error) {
      console.error("Error handling payment success:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mb-4">
          {isCompleted ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
            </div>
          )}
        </div>

        <p className="text-lg font-semibold">
          {isCompleted 
            ? "Paiement effectué avec succès" 
            : status === "failed" 
              ? "Le paiement a échoué" 
              : "Veuillez confirmer le paiement sur votre téléphone"
          }
        </p>
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
          <div className={`h-8 w-8 rounded-full ${isCompleted ? 'bg-green-500/55' : 'bg-yellow-600/60'} flex items-center justify-center`}>
            2
          </div>
        </div>
      </div>
    </div>
  )
}