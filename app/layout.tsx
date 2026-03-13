import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Memorlex",
  description: "Dil Öğrenme Uygulaması",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4697582628476361"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} bg-slate-50 dark:bg-slate-900 transition-colors duration-300`}
      >
        <Providers>
          <Navbar />
          <main className="pt-16 md:pt-20">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}