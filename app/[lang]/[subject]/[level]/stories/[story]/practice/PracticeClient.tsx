"use client";

import React from "react";
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
  return w.meaning_en || w.meaning || w.meaning_tr || "";
}

export default function StoryPracticeClient({
  vocab,
  uiLang,
  subject,
  dict,
  mode,
}: {
  vocab: any[];
  uiLang: string;
  subject: string;
  dict: any;
  mode: "writing" | "flashcard";
}) {
  const normalized: Word[] = (vocab || []).map((w: any) => ({
    ...w,
    meaning: pickMeaning(w, uiLang),
    example: w.example || "",
    type: w.type || "Word"
  }));

  if (!normalized.length) return null;

  return (
    <div className="w-full">
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