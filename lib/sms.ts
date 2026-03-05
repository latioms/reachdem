
import { getSMSAdapter, type SMSProvider } from "./adapters/sms";

export async function sendSMS(
  sender: string,
  message: string,
  phone: string,
  provider?: SMSProvider
) {
  const adapter = getSMSAdapter(provider);
  return adapter.sendSMS({ sender, message, phone });
}
