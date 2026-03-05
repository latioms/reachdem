import type { SMSAdapter, SendSMSParams, SendSMSResult } from "./types";

export const alvyTextAdapter: SMSAdapter = {
  async sendSMS({ sender, message, phone }: SendSMSParams): Promise<SendSMSResult> {
    const apiKey = process.env.ALVYTEXT_API_KEY;
    if (!apiKey) throw new Error("AlvyText: ALVYTEXT_API_KEY is not set");

    const url = `https://api.avlytext.com/v1/sms?api_key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: sender,
        recipient: phone,
        text: message,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 401) throw new Error("AlvyText: Authentication failed");
      if (status === 402) throw new Error("AlvyText: Insufficient balance");
      throw new Error(`AlvyText: Failed to send SMS (HTTP ${status})`);
    }

    const data = await response.json();

    return {
      success: true,
      message: "SMS sent",
      id: data.id,
    };
  },
};
