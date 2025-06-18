'use client'
import { useState, useRef, useEffect, useCallback } from "react"
import { trackNavigationEvent } from "@/lib/tracking"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

import SendForm  from "./send-form"

// Constante pour la limite de caractères SMS
const SMS_CHARACTER_LIMIT = 160

interface DialogCampaignProps {
    children: React.ReactNode;
    dictionary?: any;
}

export function DialogCampaign({ children, dictionary }: DialogCampaignProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [characterCount, setCharacterCount] = useState(0)

    useEffect(() => {
        setCharacterCount(message.length)
    }, [message])

    return (
        <>
            <Dialog open={open} onOpenChange={(newOpen) => {
                setOpen(newOpen)
                if (newOpen) {
                    trackNavigationEvent.modalOpen('campaign-dialog')
                } else {
                    trackNavigationEvent.modalClose('campaign-dialog')
                }
            }}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="max-w-2xl w-full">
                    <DialogHeader>
                        <DialogTitle>{dictionary?.new || "Nouvelle campagne SMS"}</DialogTitle>
                    </DialogHeader>
                    <SendForm dictionary={dictionary} />
                </DialogContent>
            </Dialog>
        </>
    )
}