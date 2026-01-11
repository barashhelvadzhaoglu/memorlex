import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";

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
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300`}>
        <Providers>
          <Navbar />
          <main className="pt-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}