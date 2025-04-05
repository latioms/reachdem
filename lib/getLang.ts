import { cookies } from "next/headers";

type Lang = "en" | "fr" 
export async function getLang() {
    
  const lang: Lang = (await cookies()).get("lang")?.value as Lang || "en";
  return lang;
}