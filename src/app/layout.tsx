import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const vintageHalloween = localFont({
  src: "../../public/fonts/vintage-halloween.otf",
  variable: "--font-vintage-halloween",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Recolt Agency",
  description: "A premium development agency.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("recolt-theme");
  const theme = themeCookie?.value || "dark";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${vintageHalloween.variable} ${syne.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
