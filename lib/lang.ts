import { cookies } from "next/headers";

type Lang = "en" | "fr" 

export async function getLang() {
  const lang: Lang = (await cookies()).get("locale")?.value as Lang || "en";
  return lang;
}

export async function setLang(lang: Lang) {
  const cookie = cookies();
  (await cookie).set("locale", lang);
}