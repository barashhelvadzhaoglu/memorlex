'use client';

import { useSearchParams } from 'next/navigation';
import ClientFlashcardApp from '@/app/components/ClientFlashcardApp';
import ClientVocabularyApp from '@/app/components/ClientVocabularyApp';

export default function UnitClientWrapper({ initialData, dict, lang, unitName }: any) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const subjectTitle = initialData.title || unitName.replace(/-/g, ' ');

  // Kelimeleri, URL'den gelen dile göre (tr, en, uk, es) önceden işleyelim.
  const processedWords = initialData.words.map((word: any) => ({
    ...word,
    meaning: word[`meaning_${lang}`] || word.meaning_en || word.meaning
  }));

  if (!mode) {
    return (
      // transition-colors eklendi
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 text-slate-900 dark:text-white text-center transition-colors duration-300">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-amber-500 italic">
          {subjectTitle}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-bold italic">
          {dict.unit?.description || "Select a study mode to start"}
        </p>
        
        <div className="grid gap-6 w-full max-w-sm">
          {/* FLASHCARD BUTONU */}
          <button 
            onClick={() => window.location.search = '?mode=flashcard'}
            // text-slate-900 dark:text-white eklenerek yazı rengi garantiye alındı
            className="p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all rounded-[32px] group shadow-xl text-slate-900 dark:text-white"
          >
            <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">🎴</span>
            <span className="text-2xl font-black uppercase tracking-tight">
              {dict.unit?.flashcards || "Flashcards"}
            </span>
          </button>
          
          {/* YAZMA PRATİĞİ BUTONU */}
          <button 
            onClick={() => window.location.search = '?mode=write'}
            // text-slate-900 dark:text-white eklendi
            className="p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all rounded-[32px] group shadow-xl text-slate-900 dark:text-white"
          >
            <span className="text-5xl block mb-4 text-blue-500 group-hover:scale-110 transition-transform">✍️</span>
            <span className="text-2xl font-black uppercase tracking-tight">
              {dict.unit?.practice || "Writing Practice"}
            </span>
          </button>
        </div>
      </main>
    );
  }

  return (
    // transition-colors eklendi
    <main className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4 transition-colors duration-300">
      {mode === 'write' ? (
        <ClientVocabularyApp 
          initialWords={processedWords} 
          lang={lang} 
          subject={subjectTitle} 
          dict={dict}
        />
      ) : (
        <ClientFlashcardApp 
          initialWords={processedWords} 
          lang={lang} 
          subject={subjectTitle} 
          dict={dict}
        />
      )}
    </main>
  );
}