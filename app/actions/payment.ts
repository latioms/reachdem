
const initPayment = async (email: string, amount: number) => {
  try {
    const response = await fetch("/api/notchpay/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        email,
        currency: "XAF",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error("Error initializing payment:", error)
    return null
  }
}

export {initPayment}