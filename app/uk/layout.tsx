import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Başlık: "Німецька мова" (Almanca) ve "Англійська мова" (İngilizce) bir arada
  title: "Вивчення німецької та англійської мови | Практичні слова A1-A2 - Memorlex",
  description: "Найкращий спосіб вивчити німецькі та англійські слова. Практична німецька для інтеграційного курсу (Integrationskurs). Безкоштовні картки для рівнів A1-A2.",
  keywords: [
    "німецька мова", 
    "англійська мова",
    "вивчення німецької мови", 
    "вивчення англійської мови",
    "німецькі слова",
    "англійські слова",
    "практична німецька",
    "практична англійська",
    "інтеграційний курс німецької мови", 
    "німецька мова для українців",
    "Integrationskurs слова",
    "запам'ятати слова",
    "німецька A1-A2"
  ],
  alternates: {
    canonical: "https://memorlex.com/uk",
  },
  openGraph: {
    title: "Memorlex | Практичне вивчення німецької та англійської мови",
    description: "Вивчайте німецькі та англійські слова безкоштовно за допомогою інтерактивних карток.",
    type: "website",
  }
};

export default function UkrainianLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}