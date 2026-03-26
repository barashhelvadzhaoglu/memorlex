"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ClientVocabularyApp from "@/app/components/ClientVocabularyApp";
import ClientFlashcardApp from "@/app/components/ClientFlashcardApp";

type Word = {
  term: string;
  type: string;
  meaning: string;
  example: string;
  [key: string]: any;
};

function pickMeaning(w: any, uiLang: string) {
  if (uiLang === "tr") return w.meaning_tr || w.meaning || "";
  if (uiLang === "uk") return w.meaning_uk || w.meaning || "";
  if (uiLang === "es") return w.meaning_es || w.meaning_en || w.meaning || ""; // ✅ İspanyolca eklendi
  return w.meaning_en || w.meaning || w.meaning_tr || "";
}

interface StoryPracticeClientProps {
  vocab: any[];
  uiLang: string;
  subject: string;
  dict: any;
  mode: "writing" | "flashcard";
}

export default function StoryPracticeClient({
  vocab,
  uiLang,
  subject,
  dict,
  mode,
}: StoryPracticeClientProps) {
  
  // ✅ Kelime listesini normalize et ve boş girişleri temizle
  const normalized: Word[] = (vocab || []).map((w: any) => ({
    ...w,
    term: w.term || w.word || w.target || "", 
    meaning: pickMeaning(w, uiLang),
    example: w.example || "",
    type: w.type || "Word"
  })).filter(w => w.term !== "");

  if (!normalized.length) {
    // Hata mesajlarını dile göre ayarla
    const emptyMsg = uiLang === "tr" 
      ? "Bu hikaye için kelime listesi bulunamadı." 
      : uiLang === "es" 
      ? "No se encontró la lista de palabras para esta historia." 
      : "Vocabulary list not found for this story.";
      
    const backBtn = uiLang === "tr" ? "Geri Dön" : uiLang === "es" ? "Volver" : "Go Back";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-950">
        <p className="text-slate-300 font-black italic uppercase tracking-widest text-lg mb-6 text-center">
           {emptyMsg}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-3 bg-amber-500 text-white rounded-full font-black italic uppercase text-xs"
        >
          &larr; {backBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 🔑 KRİTİK NOKTA: URL'e değil, gelen MODE propuna bakıyoruz */}
      {mode === "writing" ? (
        <ClientVocabularyApp 
          initialWords={normalized} 
          lang={uiLang} 
          subject={subject} 
          dict={dict} 
        />
      ) : (
        <ClientFlashcardApp 
          initialWords={normalized} 
          lang={uiLang} 
          subject={subject} 
          dict={dict} 
        />
      )}
    </div>
  );
}