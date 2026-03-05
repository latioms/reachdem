import type { SMSAdapter } from "./types";
import { alvyTextAdapter } from "./alvyText";
import { mboaSMSAdapter } from "./mboaSMS";

export type SMSProvider = "alvytext" | "mboasms";

const adapters: Record<SMSProvider, SMSAdapter> = {
  alvytext: alvyTextAdapter,
  mboasms: mboaSMSAdapter,
};

const DEFAULT_PROVIDER: SMSProvider = "alvytext";

export function getSMSAdapter(provider: SMSProvider = DEFAULT_PROVIDER): SMSAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unknown SMS provider: ${provider}`);
  }
  return adapter;
}

export { alvyTextAdapter } from "./alvyText";
export { mboaSMSAdapter } from "./mboaSMS";
export type { SMSAdapter, SendSMSParams, SendSMSResult } from "./types";
