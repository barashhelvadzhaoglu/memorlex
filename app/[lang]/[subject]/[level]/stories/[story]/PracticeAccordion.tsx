"use client";

import React, { useState } from "react";
import ClientVocabularyApp from "@/app/components/ClientVocabularyApp";
import ClientFlashcardApp from "@/app/components/ClientFlashcardApp";

type Word = { term: string; type: string; meaning: string; example: string; [key: string]: any };

function pickMeaning(w: any, uiLang: string) {
  if (uiLang === "tr") return w.meaning_tr || w.meaning || "";
  if (uiLang === "uk") return w.meaning_uk || w.meaning || "";
  if (uiLang === "es") return w.meaning_es || w.meaning_en || w.meaning || "";
  return w.meaning_en || w.meaning || w.meaning_tr || "";
}

export default function PracticeAccordion({
  vocab, uiLang, subject, dict,
}: {
  vocab: any[]; uiLang: string; subject: string; dict: any;
}) {
  const [openMode, setOpenMode] = useState<"flashcard" | "writing" | null>(null);

  const normalized: Word[] = (vocab || [])
    .map((w: any) => ({
      ...w,
      term: w.term || w.word || w.target || "",
      meaning: pickMeaning(w, uiLang),
      example: w.example || "",
      type: w.type || "Word",
    }))
    .filter((w) => w.term !== "");

  const flashcardBtn = uiLang === "tr" ? "FLASHCARD İLE ÇALIŞ"
    : uiLang === "de" ? "MIT KARTEIKARTEN LERNEN"
    : uiLang === "es" ? "ESTUDIAR CON TARJETAS"
    : uiLang === "uk" ? "ВЧИТИ З КАРТКАМИ"
    : "STUDY WITH FLASHCARDS";

  const writingBtn = uiLang === "tr" ? "YAZARAK ÇALIŞ"
    : uiLang === "de" ? "DURCH SCHREIBEN LERNEN"
    : uiLang === "es" ? "ESTUDIAR ESCRIBIENDO"
    : uiLang === "uk" ? "ВЧИТИ НАПИСАННЯМ"
    : "STUDY BY WRITING";

  const toggle = (mode: "flashcard" | "writing") => {
    setOpenMode(prev => prev === mode ? null : mode);
  };

  return (
    <div className="space-y-3">
      {/* Flashcard accordion */}
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
        <button
          onClick={() => toggle("flashcard")}
          className="w-full p-6 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <span className="text-lg font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400">
            🎴 {flashcardBtn}
          </span>
          <span className={`text-2xl transition-transform duration-300 ${openMode === "flashcard" ? "rotate-180" : ""}`}>↓</span>
        </button>
        {openMode === "flashcard" && normalized.length > 0 && (
          <div className="bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-top-2">
            <ClientFlashcardApp initialWords={normalized} lang={uiLang} subject={subject} dict={dict} />
          </div>
        )}
      </div>

      {/* Writing accordion */}
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
        <button
          onClick={() => toggle("writing")}
          className="w-full p-6 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
        >
          <span className="text-lg font-black uppercase tracking-tighter text-amber-600 dark:text-amber-400">
            ✍️ {writingBtn}
          </span>
          <span className={`text-2xl transition-transform duration-300 ${openMode === "writing" ? "rotate-180" : ""}`}>↓</span>
        </button>
        {openMode === "writing" && normalized.length > 0 && (
          <div className="bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-top-2">
            <ClientVocabularyApp initialWords={normalized} lang={uiLang} subject={subject} dict={dict} />
          </div>
        )}
      </div>
    </div>
  );
}
