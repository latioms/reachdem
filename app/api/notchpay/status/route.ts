import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const reference = url.searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ error: "Reference manquante" }, { status: 400 })
  }

  try {
    const notchPayPublicKey = process.env.NOTCHPAY_PUBLIC_KEY
    const notchPayPrivateKey = process.env.NOTCHPAY_PRIVATE_KEY

    if (!notchPayPublicKey || !notchPayPrivateKey) {
      console.error("API keys are not properly configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log(`Checking payment status for reference: ${reference}`)

   
    try {
      const statusUrl = `https://api.notchpay.co/payments/${encodeURIComponent(reference)}`
      console.log(`Fetching status from: ${statusUrl}`)

      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Grant": notchPayPrivateKey,
          Authorization: notchPayPublicKey,
        },
      })

      // First check if the response is OK
      if (!response.ok) {
        console.error(`NotchPay API returned status ${response.status}`)
        // Try to get the response as text first
        const responseText = await response.text()
        console.log(`Raw error response: ${responseText.substring(0, 200)}...`)
        
      }

      // If response is OK, get the text and try to parse as JSON
      const responseText = await response.text()
      console.log(`Raw response: ${responseText}`)
      
      try {
        
        const data = JSON.parse(responseText)
        return NextResponse.json(data, { status: 200 })

      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        return NextResponse.json({
          error: "Invalid JSON response from payment provider",
          rawResponse: responseText.substring(0, 500),
        }, { status: 500 })
      }
    } catch (fetchError) {
      console.error("Fetch error in status check:", fetchError)
      return NextResponse.json({
        error: "Connection error",
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
      }, { status: 500 })
    }
  
  } catch (error) {
    console.error("Error in status route:", error)
    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
