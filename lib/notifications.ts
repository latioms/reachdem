"use server"
import { Resend } from 'resend'
import PasswordResetEmail from "@/emails/password-reset"
import { createElement } from 'react'

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

export async function sendPasswordResetEmail(email: string, userId: string, secret: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?userId=${userId}&secret=${secret}`;
  try {
    await resend.emails.send({
      from: 'ReachDem <support@updates.reachdem.cc>',
      to: email,
      subject: 'Reset your ReachDem password',
      react: createElement(PasswordResetEmail, { userEmail: email, resetLink: resetLink }),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { error: 'Failed to send password reset email' };
  }
}
