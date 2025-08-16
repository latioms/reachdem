"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Copy, Download, QrCode } from "lucide-react"
import { toast } from "sonner"

interface QRCodeModalProps {
  qrData: string
  displayUrl?: string
  trigger?: React.ReactNode
  title?: string
  description?: string
  children?: React.ReactNode
}

export function QRCodeModal({
  qrData,
  displayUrl,
  trigger,
  title = "Code QR",
  description = "Scannez ce code QR avec votre téléphone",
  children
}: QRCodeModalProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Générer le code QR quand les données changent ou quand le modal s'ouvre
  useEffect(() => {
    if (qrData && open) {
      generateQRCode()
    }
  }, [qrData, open])
  const generateQRCode = async () => {
    if (!qrData) return
    
    setIsLoading(true)
    try {
      const dataURL = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataURL(dataURL)
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error)
      toast.error("Erreur lors de la génération du code QR")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    const textToCopy = displayUrl || qrData
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success("Contenu copié dans le presse-papier")
    } catch (error) {
      toast.error("Erreur lors de la copie" + error)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return
    
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrCodeDataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Code QR téléchargé")
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <QrCode className="h-4 w-4 mr-2" />
      Code QR
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Zone d'affichage du QR Code */}
          <div className="flex justify-center items-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Génération...</p>
              </div>
            ) : qrCodeDataURL ? (
              <Image
                src={qrCodeDataURL}
                alt="QR Code"
                width={256}
                height={256}
                className="max-w-full max-h-full rounded"
              />
            ) : (
              <div className="flex flex-col items-center">
                <QrCode className="h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-muted-foreground">Aucun code QR</p>
              </div>
            )}
          </div>          {/* URL affichée */}
          {(displayUrl || qrData) && (
            <div className="w-full">
              <p className="text-sm font-medium mb-2">Contenu :</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                  {displayUrl || qrData}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1"
              disabled={!qrData}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
            <Button
              variant="outline"
              onClick={downloadQRCode}
              className="flex-1"
              disabled={!qrCodeDataURL}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>

          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QRCodeModal
