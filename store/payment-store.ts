import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PaymentStatus = "refunded" | "processing" | "pending" | "complete" | "canceled" | "failed"

interface PaymentState {
  status: PaymentStatus
  reference: string | null
  transactionId: string | null
  amount: number | null
  phone: string | null
  recipientPhone: string | null // Add recipient phone state
  error: string | null
  // Transfer state

  setStatus: (status: PaymentStatus) => void
  setReference: (reference: string) => void
  setTransactionId: (id: string) => void
  setAmount: (amount: number) => void
  setPhone: (phone: string) => void
  setError: (error: string | null) => void
  // Transfer setters

  reset: () => void
}

// Use persist middleware to keep payment state across page refreshes
export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      status: "processing",
      reference: null,
      transactionId: null,
      amount: null,
      phone: null,
      recipientPhone: null, // Initialize recipient phone
      error: null,
      // Initialize transfer state
      transferStatus: "idle", // État initial avant l'initiation du transfert
      transferReference: null,
      transferError: null,

      setStatus: (status) => set({ status }),
      setReference: (reference) => set({ reference }),
      setTransactionId: (transactionId) => set({ transactionId }),
      setAmount: (amount) => set({ amount }),
      setPhone: (phone) => set({ phone }),
      setError: (error) => set({ error }),
      // Implement transfer setters

      reset: () =>
        set({
          status: "processing",
          reference: null,
          transactionId: null,
          amount: null,
          phone: null,
          error: null,
        }),
    }),
    {
      name: "payment-storage",
    },
  ),
)
