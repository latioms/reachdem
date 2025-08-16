import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/session";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { rating, feedback } = await request.json();

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: "Le feedback est requis" },
        { status: 400 }
      );
    }

    // Get user info from session
    const session = await getSession();
    const userEmail = session?.user?.email || "Utilisateur anonyme";
    const userId = session?.user?.userId || "Non identifié";
    
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const timestamp = new Date().toLocaleString("fr-FR", {
      timeZone: "Africa/Douala",
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
          🎯 Nouveau Feedback ReachDem
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Note donnée:</h3>
          <div style="font-size: 24px; color: #ffa500;">
            ${rating > 0 ? "⭐".repeat(Math.min(rating, 10)) + ` (${rating}/10)` : "Pas de note"}
          </div>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Commentaire:</h3>
          <p style="line-height: 1.6; color: #333; white-space: pre-wrap;">${feedback}</p>
        </div>

        <div style="font-size: 12px; color: #888; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p><strong>Informations utilisateur:</strong></p>
          <p>Email: ${userEmail}</p>
          <p>ID Utilisateur: ${userId}</p>
          <p>Date: ${timestamp}</p>
          <p>User Agent: ${userAgent}</p>
        </div>
      </div>
    `;

    // Send feedback email to admin
    const { data, error } = await resend.emails.send({
      from: "ReachDem Feedback <no-reply@updates.reachdem.cc>",
      to: ["latioms@gmail.com"],
      subject: `📝 Feedback ReachDem ${rating > 0 ? `(${rating}/10)` : ""} - ${userEmail}`,
      html: emailContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    // Send confirmation email to user if email is available
    if (userEmail && userEmail !== "Utilisateur anonyme") {
      const confirmationContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 0 30px 0;">
            <h1 style="color: #333; margin: 0; font-size: 28px;">🎯 ReachDem</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">✅ Merci pour votre feedback !</h2>
            <p style="font-size: 18px; color: #555; margin: 0; line-height: 1.6;">
              Votre retour est précieux et nous aide à améliorer ReachDem. 
            </p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">💡 Ce qui se passe maintenant :</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Notre équipe examine votre feedback attentivement</li>
              <li>Nous travaillons constamment à améliorer ReachDem</li>
              <li>Vos suggestions nous aident à créer une meilleure expérience</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Retourner à ReachDem
            </a>
          </div>

          <div style="text-align: center; font-size: 14px; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p>L'équipe ReachDem vous remercie ! 🚀</p>
            <p style="margin: 5px 0;">Reçu le ${timestamp}</p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: "ReachDem <no-reply@updates.reachdem.cc>",
        to: [userEmail],
        subject: "✅ Feedback reçu - Merci pour votre retour !",
        html: confirmationContent,
      });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    });

  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
