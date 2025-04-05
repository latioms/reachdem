import { cookies } from "next/headers";

type Lang = "en" | "fr" 

export async function getLang() {
    
  const lang: Lang = (await cookies()).get("Language")?.value as Lang || "en";
  return lang;
  
}

export async function setLang(lang: Lang) {
  const cookie = cookies();
  (await cookie).set("Language", lang, { path: "/", maxAge: 60 * 60 * 24 * 30 });
}