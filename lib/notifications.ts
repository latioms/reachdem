"use server"

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailReceipt(email: string, reference: string, amount: number) {
  try {
    await resend.emails.send({
      from: 'ReachDem <support@updates.reachdem.cc>',
      to: email,
      subject: "Reçu de paiement ReachDem",
      html: `
        <div>
          <h2>Reçu de paiement</h2>
          <p>Merci pour votre paiement. Voici les détails de votre transaction :</p>
          <ul>
            <li>Référence : ${reference}</li>
            <li>Montant : ${amount} XAF</li>
          </ul>
          <p>Les crédits SMS ont été ajoutés à votre compte.</p>
        </div>
      `
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending email receipt:', error)
    return { error: 'Failed to send email receipt' }
  }
}

export async function sendPaymentSMS(phone: string, reference: string, amount: number) {
  try {
    // Check if we have the SMS API configured
    if (!process.env.SMS_API_URL || !process.env.SMS_API_KEY) {
      console.warn('SMS API configuration missing')
      return { success: true } // Still return success to not block the flow
    }
    
    const response = await fetch(process.env.SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMS_API_KEY}`
      },
      body: JSON.stringify({
        to: phone,
        message: `ReachDem: Paiement reçu. Réf: ${reference}. Montant: ${amount} XAF. Merci de votre confiance !`
      })
    })

    if (!response.ok) {
      throw new Error('SMS API request failed')
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending payment SMS:', error)
    return { error: 'Failed to send payment SMS' }
  }
}