import type { SMSAdapter, SendSMSParams, SendSMSResult } from "./types";

export const mboaSMSAdapter: SMSAdapter = {
  async sendSMS({ sender, message, phone }: SendSMSParams): Promise<SendSMSResult> {
    const userID = process.env.NEXT_PUBLIC_MBOA_SMS_USERID;
    const password = process.env.NEXT_PUBLIC_MBOA_SMS_API_PASSWORD;
    if (!userID || !password) throw new Error("MboaSMS: credentials are not set");
    const response = await fetch("https://mboadeals.net/api/v1/sms/sendsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userID,
        password: password,
        message: message,
        phone_str: phone,
        sender_name: sender,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send SMS via MboaSMS");
    }

    const data = await response.json();

    return {
      success: data.success === true || data.message === "SUCCESS",
      message: data.message ?? "SMS sent",
    };
  },
};
