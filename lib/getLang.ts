import { cookies } from "next/headers";

export async function getLang() {
    
  const lang = (await cookies()).get("lang")?.value;
  return lang;
}