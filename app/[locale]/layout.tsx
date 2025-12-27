import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import AuthWrapper from "@/components/AuthWrapper";
import NavBar from "@/components/Layout/Navbar";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsStatus } from "@/components/ui/mixpanel-status";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import checkAuth from "../actions/chechAuth";
import { Sidebar } from "@/providers/SidebarProvider";
import { getDictionary } from "./dictionaries";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic'


export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

// Layout
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {

  const { isAuthenticated } = await checkAuth()
  const { locale } = await params;
  const dictionary = await getDictionary(locale as 'en' | 'fr');
  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="facebook-domain-verification" content="scys6nt50s3yllrgoz9gfen1bv217d" />
      </head>
      <body className="overflow-x-hidden w-full" suppressHydrationWarning>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <AuthWrapper>
              <Toaster richColors />
              {!isAuthenticated && (
                <>
                  <NavBar dictionary={dictionary.landing.nav} />
                  <main>{children}</main>
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
        <Analytics />
      </body>
    </html>
  );
}