import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

    // Get user info from request (you might want to get this from session)
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
          <p><strong>Informations techniques:</strong></p>
          <p>Date: ${timestamp}</p>
          <p>User Agent: ${userAgent}</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "ReachDem Feedback <no-reply@updates.reachdem.cc>",
      to: ["latioms@gmail.com"],
      subject: `📝 Feedback ReachDem ${rating > 0 ? `(${rating}/10)` : ""}`,
      html: emailContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
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
