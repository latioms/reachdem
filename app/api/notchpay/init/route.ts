import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount, email, currency = "XAF" } = await request.json()
    const reference = "pay." + Math.floor(Math.random() * 1000000) // Generate a random reference

    if (!amount || !email) {
      return NextResponse.json({ error: "Missing amount or email" }, { status: 400 })
    }

    const notchPayPublicKey = process.env.NOTCHPAY_PUBLIC_KEY

    if (!notchPayPublicKey) {
      console.error("API keys are not properly configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("Initializing payment:", { amount, email, currency, reference })

    const response = await fetch("https://api.notchpay.co/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: notchPayPublicKey, // Send the public key directly without Bearer prefix
      },
      body: JSON.stringify({
        currency: currency,
        amount: amount,
        reference: reference,
        customer: {
          email: email,
        },
      }),
    })

    const responseText = await response.text()
    console.log("Raw initialization response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse JSON response:", e)
      return NextResponse.json(
        {
          error: "Invalid response from payment provider",
          rawResponse: responseText.substring(0, 500), // Limit the size
        },
        { status: 500 },
      )
    }

    if (!response.ok) {
      console.error("API Error:", data)
      return NextResponse.json({ error: data.message || "Failed to initiate payment" }, { status: response.status })
    }

    // Return the full response from NotchPay
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error initiating NotchPay payment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
