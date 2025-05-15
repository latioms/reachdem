import { Geist, Geist_Mono } from "next/font/google";
import AuthWrapper from "@/components/AuthWrapper";
import NavBar from "@/components/Layout/Navbar";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import "../globals.css";
import checkAuth from "../actions/chechAuth";
import { Sidebar } from "@/providers/SidebarProvider";
import  {getDictionary}  from "./dictionaries";

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

  const {isAuthenticated} = await checkAuth()
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthWrapper>
            <Toaster richColors />
            {!isAuthenticated && (
              <>
                <NavBar />
                <main>{children}</main>
              </>
            )}
            {isAuthenticated && (
              <Sidebar dictionary={dictionary}>
                <main className="container mx-auto p-4">{children}</main>
              </Sidebar>
            )}
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}