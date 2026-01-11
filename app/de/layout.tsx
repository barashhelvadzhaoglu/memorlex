import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Başlık: "Deutsch lernen" ve "Englisch lernen" bir arada
  title: "Deutsch lernen & Englisch lernen | Deutsche Vokabeln & Englische Vokabeln - Memorlex",
  description: "Ihre Plattform für praktisches Deutsch und praktisches Englisch. Lernen Sie Vokabeln für den Integrationskurs (A1-A2) mit interaktiven Flashcards kostenlos online.",
  keywords: [
    "Deutsch lernen",
    "Englisch lernen",
    "Deutsche Vokabeln",
    "Englische Vokabeln",
    "Praktisches Deutsch",
    "Praktisches Englisch",
    "Vokabeltrainer",
    "Integrationskurs Vokabeln",
    "Deutsch A1 A2",
    "Vokabeln auswendig lernen",
    "Englisch für Anfänger",
    "Kostenlos Deutsch üben"
  ],
  alternates: {
    canonical: "https://memorlex.com/de",
  },
  openGraph: {
    title: "Memorlex | Praktischer Vokabeltrainer für Deutsch & Englisch",
    description: "Meistern Sie deutsche und englische Vokabeln mit unseren interaktiven Karteikarten.",
    type: "website",
  }
};

export default function GermanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}