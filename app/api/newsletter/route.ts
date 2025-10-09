import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "appwrite";
import { Resend } from "resend";
import { databases } from "@/lib/appwrite";

const APPWRITE_DB_ID =
  process.env.APPWRITE_NEWSLETTER_DATABASE_ID ??
  process.env.NEXT_PUBLIC_APPWRITE_NEWSLETTER_DATABASE_ID ??
  process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID;
const APPWRITE_COLLECTION_ID =
  process.env.APPWRITE_NEWSLETTER_COLLECTION_ID ??
  process.env.NEXT_PUBLIC_APPWRITE_NEWSLETTER_COLLECTION_ID ??
  process.env.NEXT_PUBLIC_APPWRITE_MAILING_NEWSLETTER_COLLECTION_ID ??
  process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID;

const resendApiKey = process.env.RESEND_API_KEY;
const resendRecipient = process.env.NEWSLETTER_NOTIFICATION_EMAIL ?? "latioms@gmail.com";

const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/i;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Adresse e-mail manquante." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Adresse e-mail invalide." },
        { status: 422 }
      );
    }

    let stored = false;
    let alreadySubscribed = false;
    let notified = false

    if (APPWRITE_DB_ID && APPWRITE_COLLECTION_ID) {
      try {
        const existing = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
          Query.equal("email", normalizedEmail),
        ]);

        if (existing.total > 0) {
          alreadySubscribed = true;
        } else {
          await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, ID.unique(), {
            email: normalizedEmail,
            source: "cooking-page",
            subscribed_at: new Date().toISOString(),
          });
          stored = true;
        }
      } catch (storageError) {
        console.error("Newsletter storage error", storageError);
      }
    }

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "ReachDem Newsletter <register@updates.reachdem.cc>",
          to: [resendRecipient],
          subject: "Nouvelle inscription à la newsletter",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
              <h2 style="color: #111827;">Nouvel abonnement newsletter</h2>
              <p style="font-size: 15px; color: #374151;">Une nouvelle personne vient de s'inscrire :</p>
              <p style="font-size: 16px; font-weight: 600; color: #111827;">${normalizedEmail}</p>
              <p style="font-size: 12px; color: #6B7280;">${new Date().toLocaleString("fr-FR", { timeZone: "Africa/Douala" })}</p>
            </div>
          `,
        });
        notified = true
      } catch (emailError) {
        console.error("Newsletter notification error", emailError);
      }
    }

    if (stored || alreadySubscribed || notified) {
      return NextResponse.json({
        success: true,
        alreadySubscribed,
        stored,
        notified,
      })
    }

    return NextResponse.json(
      { error: "Votre demande n'a pas pu être enregistrée. Veuillez réessayer plus tard." },
      { status: 500 }
    )
  } catch (error) {
    console.error("Newsletter subscription error", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer votre inscription pour le moment." },
      { status: 500 }
    );
  }
}
