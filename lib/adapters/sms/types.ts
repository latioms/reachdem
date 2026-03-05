export interface SendSMSParams {
  sender: string;
  message: string;
  phone: string;
}

export interface SendSMSResult {
  success: boolean;
  message: string;
  id?: string;
}

export interface SMSAdapter {
  sendSMS(params: SendSMSParams): Promise<SendSMSResult>;
}
