"use client";

import React, { useState } from "react";

export default function StoryQuestions({ questions, lang }: { questions: any[], lang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleOptionClick = (qIdx: number, option: string) => {
    if (selectedAnswers[qIdx]) return; // Zaten cevaplandıysa değiştirme
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  return (
    <section className="mt-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
      >
        <h3 className="text-lg font-black uppercase tracking-tighter text-amber-500">
          {/* ✅ İspanyolca (es) eklendi */}
          {lang === "tr" 
            ? "🤔 Hikaye Soruları" 
            : lang === "de" 
            ? "🤔 Fragen zur Geschichte" 
            : lang === "es"
            ? "🤔 Preguntas sobre la historia"
            : "🤔 Story Questions"}
        </h3>
        <span className={`text-2xl transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          ↓
        </span>
      </button>

      {isOpen && (
        <div className="p-6 space-y-8 bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-top-2">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-4">
              <p className="font-bold text-lg text-slate-800 dark:text-slate-200">
                {qIdx + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((option: string) => {
                  const isSelected = selectedAnswers[qIdx] === option;
                  const isCorrect = option === q.answer;
                  const hasAnswered = !!selectedAnswers[qIdx];

                  let btnStyle = "border-slate-200 dark:border-slate-800 hover:border-amber-400";
                  if (hasAnswered) {
                    if (isCorrect) btnStyle = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600";
                    else if (isSelected) btnStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600";
                    else btnStyle = "opacity-50 border-slate-100 dark:border-slate-900";
                  }

                  return (
                    <button
                      key={option}
                      disabled={hasAnswered}
                      onClick={() => handleOptionClick(qIdx, option)}
                      className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}