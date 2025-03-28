import { getDictionary } from "./dictionaries";

export default async function Page({
    params,
}: {
    params: Promise<{ lang: "en" | "fr" }>;
}
) { 
    const lang = (await params).lang;
    const dict = await getDictionary(lang);
    return (
        <div className="container">
            <h1>{dict.hello}</h1>
            <p>{dict.welcome}</p>
        </div>
    );
}