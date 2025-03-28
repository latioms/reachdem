import { Geist, Geist_Mono } from "next/font/google";
import { getDictionary } from "./dictionaries";

// fonts 
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

//metadata, params and SEO
export async function generateStaticParams() {
    return [{ lang: "en" }, { lang: "fr" }];
  }

// Layout

export default async function RootLayout({
    children,
    params,
  }: Readonly<{
    children: React.ReactNode;
    params: Promise<{lang: "en" | "fr"}>;
  }>) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
  
    return (
      <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>{children}</body>
      </html>
    );
  }