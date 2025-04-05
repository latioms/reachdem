import { Geist, Geist_Mono } from "next/font/google";
import AuthWrapper from "@/components/AuthWrapper";
import NavBar from "@/components/Layout/Navbar";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";

// fonts 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}

// Layout

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string}>;
}>) {

  const {locale} = await params;
  
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = getMessages()
  
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NextIntlClientProvider messages={messages}>
          <AuthWrapper>
            <Toaster richColors />
            <NavBar />
            <main className="container mx-auto p-4">{children}</main>
          </AuthWrapper>
        </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}