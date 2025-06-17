import { isMTN } from "@/lib/phone";
import { sendSMS } from "@/lib/sms";


export async function sendSMSAction(sender: string, message: string, phone: string) {
    let senderName = sender.length > 11 ? sender.slice(0, 11) : sender;
    
    if (isMTN(phone)){
        senderName = 'infos'
    }
    
    try {
        const response = await sendSMS(senderName, message, phone);

        if (response.success === true || response.message === "SUCCESS") {
            return {
                response: {
                    message: response.message,
                    success: response.success,
                },
            };
        }

    } catch (error) {
        console.error("Error sending SMS:", error);
        return {
            error: "Failed to send SMS",
        };
    }
}