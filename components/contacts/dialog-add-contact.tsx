'use client'
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { ContactForm } from "./contact-form"

interface DialogAddContactProps {
  children: React.ReactNode;
  dictionary?: any;
  onSuccess?: () => void;
}

export function DialogAddContact({ children, dictionary, onSuccess }: DialogAddContactProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dictionary?.contacts?.form?.title || "Ajouter un nouveau contact"}
            </DialogTitle>
          </DialogHeader>
          <ContactForm onSuccess={handleSuccess} dictionary={dictionary} />
        </DialogContent>
      </Dialog>
    </>
  )
}
