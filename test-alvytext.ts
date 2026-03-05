import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env before importing adapter (env must be set before module-level reads)
const envPath = resolve(__dirname, ".env");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx);
  const value = trimmed.slice(idx + 1);
  if (!process.env[key]) process.env[key] = value;
}

async function main() {
  console.log("Testing AlvyText SMS adapter...");

  const { alvyTextAdapter } = await import("./lib/adapters/sms/alvyText");

  const result = await alvyTextAdapter.sendSMS({
    sender: "ReachDem",
    message: "Test ReachDem - AlvyText integration OK ✅",
    phone: "+237699875974",
  });

  console.log("Result:", result);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
