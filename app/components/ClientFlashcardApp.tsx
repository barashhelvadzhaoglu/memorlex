"use client";

import React, { useState, useMemo, useEffect } from 'react';

// JSON yapına tam uyumlu Interface
interface Word {
  term: string;    // Almanca kelime
  type: string;    // Kelime türü
  meaning: string; // Türkçe anlamı
  example: string; // Örnek cümle
}

interface Props {
  initialWords: Word[];
  lang: string;
  subject: string;
}

const translations: any = {
  tr: { back: "← Geri", start: "BAŞLAT", close: "KAPAT", flip: "Çevirmek için dokun", prev: "GERİ", next: "İLERİ", finish: "BİTİR", doneTitle: "Tebrikler!", doneDesc: "kelime tamamlandı.", retry: "TEKRAR ET", changeRange: "ARALIK DEĞİŞTİR", nextSet: "SIRADAKİ SETE GEÇ →" },
  en: { back: "← Back", start: "START", close: "CLOSE", flip: "Tap to flip", prev: "BACK", next: "NEXT", finish: "FINISH", doneTitle: "Well Done!", doneDesc: "words finished.", retry: "RETRY", changeRange: "CHANGE RANGE", nextSet: "NEXT SET →" },
  de: { back: "← Zurück", start: "START", close: "BEENDEN", flip: "Klicken zum Umdrehen", prev: "ZURÜCK", next: "WEITER", finish: "FERTIG", doneTitle: "Gut gemacht!", doneDesc: "Wörter gelernt.", retry: "WIEDERHOLEN", changeRange: "BEREICH ÄNDERN", nextSet: "NÄCHSTES SET →" }
};

export default function ClientFlashcardApp({ initialWords, lang, subject }: Props) {
  const [view, setView] = useState<'setup' | 'practice' | 'summary'>('setup');
  const [currentSet, setCurrentSet] = useState<Word[]>([]);
  const [fIdx, setFIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [range, setRange] = useState({ start: 1, end: Math.min(10, initialWords?.length || 0) });
  const [lastRangeSize, setLastRangeSize] = useState(10);

  const t = useMemo(() => translations[lang] || translations.tr, [lang]);

  const fTypeColors: any = { 
    "İsim": "#f59e0b", "Fiil": "#3b82f6", "Sıfat": "#ec4899", "Zarf": "#10b981", "DEFAULT": "#94a3b8" 
  };

  const shuffle = (array: Word[]) => [...array].sort(() => Math.random() - 0.5);

  const launchFlashcards = (start: number, end: number) => {
    setLastRangeSize(end - start + 1);
    setRange({ start, end });
    const sliced = initialWords.slice(start - 1, end);
    setCurrentSet(shuffle(sliced));
    setFIdx(0);
    setIsFlipped(false);
    setView('practice');
  };

  const handleNextSet = () => {
    const nextStart = range.end + 1;
    const nextEnd = Math.min(nextStart + lastRangeSize - 1, initialWords.length);
    if (nextStart <= initialWords.length) launchFlashcards(nextStart, nextEnd);
  };

  return (
    <div className="max-w-md mx-auto p-4 font-sans text-white">
      
      {/* 1. SETUP EKRANI */}
      {view === 'setup' && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl text-center">
          <h2 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">{subject}</h2>
          <div className="flex gap-3 justify-center mb-8">
            {[10, 20, 30].map(n => (
              <button key={n} onClick={() => launchFlashcards(1, Math.min(n, initialWords.length))} className="w-14 h-14 rounded-2xl border-2 border-slate-800 font-black text-slate-400 hover:border-amber-500 transition-all">{n}</button>
            ))}
          </div>
          <div className="flex gap-4 justify-center items-center mb-10">
            <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-20 p-4 bg-slate-800 border-none rounded-2xl text-center font-bold text-xl outline-none focus:ring-2 ring-amber-500 text-white" />
            <span className="text-slate-600">—</span>
            <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-20 p-4 bg-slate-800 border-none rounded-2xl text-center font-bold text-xl outline-none focus:ring-2 ring-amber-500 text-white" />
          </div>
          <button onClick={() => launchFlashcards(range.start, range.end)} className="w-full py-5 bg-amber-500 text-slate-950 rounded-[24px] font-black text-lg shadow-xl hover:bg-amber-400 transition-all uppercase">
            {t.start} ({initialWords.length} Kelime)
          </button>
        </div>
      )}

      {/* 2. PRACTICE EKRANI */}
      {view === 'practice' && currentSet.length > 0 && (
        <div className="animate-in fade-in duration-700">
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full">{fIdx + 1} / {currentSet.length}</span>
            <button onClick={() => setView('setup')} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">{t.close}</button>
          </div>

          <div className="relative h-[400px]" style={{ perspective: '1200px' }}>
            <div 
              onClick={() => setIsFlipped(!isFlipped)} 
              className="relative w-full h-full transition-all duration-500 cursor-pointer"
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* ÖN YÜZ (Anlam) */}
              <div className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-[48px] flex flex-col items-center justify-center p-10 text-center shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black text-white mb-8 uppercase" style={{ background: fTypeColors[currentSet[fIdx]?.type] || fTypeColors["DEFAULT"] }}>
                  {currentSet[fIdx]?.type}
                </span>
                <h2 className="text-3xl font-black mb-4 leading-tight text-white">{currentSet[fIdx]?.meaning}</h2>
                <span className="absolute bottom-10 text-[10px] text-slate-600 font-bold uppercase tracking-[3px]">{t.flip}</span>
              </div>

              {/* ARKA YÜZ (Almanca Kelime ve Örnek) */}
              <div className="absolute inset-0 bg-amber-500 rounded-[48px] flex flex-col items-center justify-center p-10 text-center text-slate-950 shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h2 className="text-4xl font-black tracking-tighter leading-tight mb-6">{currentSet[fIdx]?.term}</h2>
                <div className="w-16 h-1 bg-slate-950/20 rounded-full mb-6"></div>
                <p className="text-slate-900 italic text-sm leading-relaxed font-medium">
                  {currentSet[fIdx]?.example.replace('***', currentSet[fIdx]?.term)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setTimeout(() => setFIdx(fIdx - 1), 150); }} 
              disabled={fIdx === 0} 
              className="flex-1 py-5 rounded-[24px] font-black bg-slate-900 border border-slate-800 disabled:opacity-20 transition-all text-sm uppercase tracking-widest text-white"
            >
              {t.prev}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if (fIdx < currentSet.length - 1) { setIsFlipped(false); setTimeout(() => setFIdx(fIdx + 1), 150); } else setView('summary'); }} 
              className="flex-[2] py-5 rounded-[24px] font-black bg-white text-slate-950 shadow-xl hover:bg-slate-100 transition-all text-sm uppercase tracking-widest"
            >
              {fIdx === currentSet.length - 1 ? t.finish : t.next}
            </button>
          </div>
        </div>
      )}

      {/* 3. SUMMARY EKRANI */}
      {view === 'summary' && (
        <div className="text-center bg-slate-900 p-12 rounded-[48px] border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-7xl mb-8">🏆</div>
          <h2 className="text-3xl font-black mb-3">{t.doneTitle}</h2>
          <p className="text-slate-500 mb-10 font-bold">{currentSet.length} {t.doneDesc}</p>
          <div className="space-y-4">
            {range.end < initialWords.length && (
              <button onClick={handleNextSet} className="w-full py-5 bg-white text-slate-950 rounded-[24px] font-black text-sm shadow-xl hover:scale-105 transition-all">{t.nextSet}</button>
            )}
            <button onClick={() => launchFlashcards(range.start, range.end)} className="w-full py-5 bg-amber-500 text-slate-950 rounded-[24px] font-black text-sm shadow-xl hover:scale-105 transition-all">{t.retry}</button>
            <button onClick={() => setView('setup')} className="w-full py-5 bg-slate-800 text-slate-400 rounded-[24px] font-black text-sm hover:text-white transition-all">{t.changeRange}</button>
          </div>
        </div>
      )}
    </div>
  );
}