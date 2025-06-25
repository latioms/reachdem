import { Geist, Geist_Mono } from "next/font/google";
import AuthWrapper from "@/components/AuthWrapper";
import NavBar from "@/components/Layout/Navbar";
import { Footer } from "@/components/Landing/Footer";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsStatus } from "@/components/ui/mixpanel-status";
import "../globals.css";
import checkAuth from "../actions/chechAuth";
import { Sidebar } from "@/providers/SidebarProvider";
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


export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

// Layout
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: 'en' | 'fr' };
}>) {

  const { isAuthenticated } = await checkAuth()
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="facebook-domain-verification" content="scys6nt50s3yllrgoz9gfen1bv217d" />
      </head>
      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      <body className="overflow-x-hidden w-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <AuthWrapper>
              <Toaster richColors />
              {!isAuthenticated && (<>
                <NavBar dictionary={dictionary.landing.nav} />
                <main>{children}</main>
                <Footer dictionary={dictionary.footer} locale={locale} />
              </>
              )}
              {isAuthenticated && (
                <Sidebar dictionary={dictionary}>
                  <main className="container mx-auto p-4">{children}</main>
                </Sidebar>
              )}
            </AuthWrapper>
            <AnalyticsStatus />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}