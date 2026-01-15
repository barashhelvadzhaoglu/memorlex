'use client';

import { useSearchParams } from 'next/navigation';
import ClientFlashcardApp from '@/app/components/ClientFlashcardApp';
import ClientVocabularyApp from '@/app/components/ClientVocabularyApp';

export default function UnitClientWrapper({ initialData, dict, lang, unitName }: any) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // Artık tarayıcı tarafında okuyoruz!

  const subjectTitle = initialData.title || unitName.replace(/-/g, ' ');

  if (!mode) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-white text-center">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-amber-500">
          {subjectTitle}
        </h1>
        <p className="text-slate-400 mb-10 font-bold italic">{dict.description}</p>
        <div className="grid gap-6 w-full max-w-sm">
          <button 
            onClick={() => window.location.search = '?mode=flashcard'}
            className="p-8 bg-slate-900 border-2 border-amber-500/30 hover:border-amber-500 rounded-[32px] transition-all group"
          >
            <span className="text-5xl block mb-4">🎴</span>
            <span className="text-2xl font-black">{dict.flashcards}</span>
          </button>
          <button 
            onClick={() => window.location.search = '?mode=write'}
            className="p-8 bg-slate-900 border-2 border-blue-500/30 hover:border-blue-600 rounded-[32px] transition-all group"
          >
            <span className="text-5xl block mb-4 text-blue-500">✍️</span>
            <span className="text-2xl font-black">{dict.practice}</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 py-8 px-4">
      {mode === 'write' ? (
        <ClientVocabularyApp initialWords={initialData.words} lang={lang} subject={subjectTitle} />
      ) : (
        <ClientFlashcardApp initialWords={initialData.words} lang={lang} subject={subjectTitle} />
      )}
    </main>
  );
}