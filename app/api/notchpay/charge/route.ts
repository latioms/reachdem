import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reference, channel, phone } = body

    console.log("Charge request received:", { reference, channel, phone })

    if (!reference || !channel || !phone) {
      console.error("Missing parameters:", { reference, channel, phone })
      return NextResponse.json({ error: "Missing reference, channel, or phone" }, { status: 400 })
    }

    const notchPayPublicKey = process.env.NOTCHPAY_PUBLIC_KEY

    if (!notchPayPublicKey) {
      console.error("API keys are not properly configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const chargeUrl = `https://api.notchpay.co/payments/${reference}`
    console.log("Charging payment at URL:", chargeUrl)

    const response = await fetch(chargeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: notchPayPublicKey, // Send the public key directly without Bearer prefix
      },
      body: JSON.stringify({
        channel: channel,
        data: {
          phone: phone,
        },
      }),
    })

    const responseText = await response.text()
    console.log("Raw charge response:", responseText)

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
      console.error("NotchPay API Charge Error:", data)
      return NextResponse.json(
        {
          error: data.message || "Failed to charge payment",
          details: data,
        },
        { status: response.status || 500 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error charging NotchPay payment:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
