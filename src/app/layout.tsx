
import Script from "next/script";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
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

  const nonce = (await headers()).get("x-nonce") || undefined;


  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${vintageHalloween.variable} ${syne.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5VPBWN62"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {children}

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive" nonce={nonce}>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5VPBWN62');
          `}
        </Script>
        {/* End Google Tag Manager */}

        <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-QJMHDVD4MN"
  strategy="afterInteractive"
  nonce={nonce}
/>

<Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-QJMHDVD4MN');
  `}
</Script>

 <Script id="clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xgtb5qceny");
        `}
</Script>
        
      </body>
    </html>
  );
}
