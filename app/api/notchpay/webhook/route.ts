import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

// Function to verify webhook signature
function verifySignature(payload: string, signature: string, secretKey: string): boolean {
  try {
    // Create HMAC using the secret key and payload
    const hmac = crypto.createHmac("sha256", secretKey)
    hmac.update(payload)
    const calculatedSignature = hmac.digest("hex")

    // Compare the calculated signature with the provided signature
    return crypto.timingSafeEqual(Buffer.from(calculatedSignature, "hex"), Buffer.from(signature, "hex"))
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    // Get the raw request body as text for signature verification
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // Get the signature from headers
    const headersList = await headers()
    const signature = (await headersList).get("x-notch-signature")

    // Get the private key for signature verification
    const privateKey = process.env.NOTCHPAY_PRIVATE_KEY

    if (!signature || !privateKey) {
      console.error("Missing signature or private key")
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Verify the signature
    const isValid = verifySignature(rawBody, signature, privateKey)

    if (!isValid) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = body?.payload?.event
    const data = body?.payload?.data

    if (!event || !data) {
      return NextResponse.json({ error: "Missing event or data" }, { status: 400 })
    }

    console.log(`📥 Webhook event received: ${event}`)
    console.log("Webhook data:", data)

    // Process different event types
    switch (event) {
      case "payment.complete":
        // Payment successful
        console.log(`✅ Payment successful for ${data.reference} (Amount: ${data.amount} ${data.currency})`)
        // Here you would typically update your database or trigger other actions
        break

      case "payment.failed":
        // Payment failed
        console.log(`❌ Payment failed for ${data.reference}`)
        break

      case "payment.canceled":
        // Payment canceled
        console.log(`🚫 Payment canceled for ${data.reference}`)
        break

      case "transfer.initiated":
        // Transfer initiated
        console.log(`🔄 Transfer initiated to ${data.customer}`)
        break

      case "transfer.complete":
        // Transfer completed
        console.log(`✅ Transfer completed for ${data.reference}`)
        break

      case "transfer.failed":
        // Transfer failed
        console.log(`❌ Transfer failed for ${data.reference}`)
        break

      default:
        console.log(`⚠️ Unhandled event: ${event}`)
        break
    }

    // Always return a 200 response to acknowledge receipt of the webhook
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("❗ Error in webhook handler:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
