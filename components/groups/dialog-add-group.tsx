'use client'
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { GroupForm } from "./group-form"

interface DialogAddGroupProps {
  children: React.ReactNode;
  dictionary?: any;
  onSuccess?: () => void;
}

export function DialogAddGroup({ children, dictionary, onSuccess }: DialogAddGroupProps) {
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
              {dictionary?.groups?.createGroup || "Créer un nouveau groupe"}
            </DialogTitle>
          </DialogHeader>
          <GroupForm onSuccess={handleSuccess} dictionary={dictionary} />
        </DialogContent>
      </Dialog>
    </>
  )
}
