'use client'
import { useState, useRef, useEffect, useCallback } from "react"

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


export function DialogCampaign({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [characterCount, setCharacterCount] = useState(0)

    useEffect(() => {
        setCharacterCount(message.length)
    }, [message])

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle campagne SMS</DialogTitle>
                    </DialogHeader>
                    <SendForm />
                </DialogContent>
            </Dialog>
        </>
    )

}