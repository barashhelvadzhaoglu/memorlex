import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Başlıkta en kritik 4 kelimeyi birleştirdik
  title: "Almanca Öğren & İngilizce Öğren | Almanca Kelime & İngilizce Kelime - Memorlex",
  description: "Pratik Almanca ve pratik İngilizce kelime ezberleme platformu. Entegrasyon kursu A1-A2 kelimeleri, interaktif flashcardlar ve kelime listeleriyle ücretsiz dil öğrenin.",
  keywords: [
    "Almanca öğren", 
    "İngilizce öğren",
    "Almanca kelime", 
    "İngilizce kelime",
    "Pratik Almanca",
    "Pratik İngilizce",
    "Almanca kelime ezberle", 
    "İngilizce kelime ezberle",
    "Almanca entegrasyon kursu", 
    "A1 Almanca kelimeler", 
    "A2 İngilizce kelimeler",
    "Kolay İngilizce öğrenme",
    "Hızlı Almanca öğrenme",
    "Kelime çalışma kartları",
    "Ücretsiz dil kursu"
  ],
  alternates: {
    canonical: "https://memorlex.com/tr",
  },
  openGraph: {
    title: "Memorlex | Pratik Almanca ve İngilizce Kelime Ezberle",
    description: "Almanca ve İngilizce kelime haznenizi flashcardlar ile ücretsiz geliştirin.",
    type: "website",
  }
};

export default function TurkishLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}