'use server';

// set lang in cookies
import { cookies } from "next/headers";

export async function setLang(lang: 'en' | 'fr') {
    (await cookies()).set({
        name: "NEXT_LOCALE",
        value: lang,
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });
}