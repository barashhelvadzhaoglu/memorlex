import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Başlık: Global aramalar için "Learn German" ve "Learn English" bir arada
  title: "Learn German & Learn English | German Words & English Words - Memorlex",
  description: "Your platform for practical German and practical English vocabulary. Master integration course words and A1-A2 level lists with interactive flashcards for free.",
  keywords: [
    "learn German",
    "learn English",
    "German words",
    "English words",
    "practical German",
    "practical English",
    "German vocabulary",
    "English vocabulary",
    "German integration course",
    "vocabulary builder",
    "German A1-A2",
    "learn German online free",
    "English for beginners"
  ],
  alternates: {
    canonical: "https://memorlex.com/en",
  },
  openGraph: {
    title: "Memorlex | Master Practical German & English Vocabulary",
    description: "Learn German and English words effectively with our interactive flashcard system.",
    type: "website",
  }
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}