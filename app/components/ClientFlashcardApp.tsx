"use client";

import React, { useState, useMemo, useEffect } from 'react';

interface Word {
  term: string;
  type: string;
  meaning: string;
  example: string;
  [key: string]: any;
}

interface Props {
  initialWords: Word[];
  lang: string;
  subject: string;
  dict: any;
}

const translations: any = {
  tr: { 
    back: "← Geri", start: "BAŞLAT", close: "KAPAT", flip: "Çevirmek için dokun", 
    prev: "GERİ", next: "İLERİ", finish: "BİTİR", doneTitle: "Tebrikler!", 
    doneDesc: "kelime tamamlandı.", retry: "TEKRAR ET", nextSet: "SIRADAKİ SET →", 
    goHome: "ANA SAYFAYA DÖN", setupLabel: "Çalışmak istediğiniz kelime sayısını seçin" 
  },
  en: { 
    back: "← Back", start: "START", close: "CLOSE", flip: "Tap to flip", 
    prev: "BACK", next: "NEXT", finish: "FINISH", doneTitle: "Well Done!", 
    doneDesc: "words finished.", retry: "RETRY", nextSet: "NEXT SET →", 
    goHome: "GO TO HOME", setupLabel: "Select the number of words to study" 
  }
};

export default function ClientFlashcardApp({ initialWords, lang, subject, dict }: Props) {
  const [view, setView] = useState<'setup' | 'practice' | 'summary'>('setup');
  const [currentSet, setCurrentSet] = useState<Word[]>([]);
  const [fIdx, setFIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // DÜZELTME: Başlangıçta tüm kelimeleri kapsayacak şekilde range ayarlandı
  const [range, setRange] = useState({ start: 1, end: initialWords?.length || 0 });
  const [lastRangeSize, setLastRangeSize] = useState(10);

  // initialWords değiştiğinde (yüklendiğinde) range'i tekrar güncelle
  useEffect(() => {
    if (initialWords?.length > 0) {
      setRange({ start: 1, end: initialWords.length });
    }
  }, [initialWords]);

  const t = useMemo(() => {
    return dict?.flashcards || translations[lang] || translations.tr;
  }, [dict, lang]);

  const fTypeColors: any = { 
    "İsim": "#f59e0b", "Noun": "#f59e0b",
    "Fiil": "#3b82f6", "Verb": "#3b82f6",
    "Sıfat": "#ec4899", "Adjective": "#ec4899",
    "Zarf": "#10b981", "Adverb": "#10b981",
    "Phrase": "#64748b", "İfade": "#64748b",
    "DEFAULT": "#94a3b8" 
  };

  const launchFlashcards = (start: number, end: number) => {
    setLastRangeSize(end - start + 1);
    const sliced = initialWords.slice(start - 1, end);
    setCurrentSet([...sliced].sort(() => Math.random() - 0.5));
    setFIdx(0);
    setIsFlipped(false);
    setView('practice');
  };

  const handleNextSet = () => {
    const nextStart = range.end + 1;
    const nextEnd = Math.min(nextStart + lastRangeSize - 1, initialWords.length);
    if (nextStart <= initialWords.length) {
      setRange({ start: nextStart, end: nextEnd });
      launchFlashcards(nextStart, nextEnd);
    }
  };

  const SafeText = ({ children, color }: { children: any, color: string }) => (
    <span style={{ color: `${color} !important`, display: 'block', width: '100%', opacity: 1 }}>
      {children}
    </span>
  );

  return (
    <div className="max-w-md mx-auto p-4 font-sans min-h-screen">
      
      {/* 1. SETUP EKRANI */}
      {view === 'setup' && (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-2xl text-center">
          <h2 className="text-slate-400 font-bold text-[10px] uppercase tracking-[2px] mb-6 italic opacity-70">{subject}</h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-4 italic">
            {t.setupLabel || "Çalışmak istediğiniz kelime sayısını seçin"}
          </p>

          <div className="flex gap-3 justify-center mb-8">
            {[10, 15, 20].map(n => (
              <button 
                key={n} 
                onClick={() => {
                  setRange({ start: 1, end: n });
                  launchFlashcards(1, Math.min(n, initialWords.length));
                }} 
                className="w-14 h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-black text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 transition-all cursor-pointer"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex gap-4 justify-center items-center mb-10">
            <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-20 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-center font-bold text-xl text-slate-900 dark:text-white" />
            <span className="text-slate-400 font-bold">—</span>
            <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-20 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-center font-bold text-xl text-slate-900 dark:text-white" />
          </div>

          <button 
            onClick={() => launchFlashcards(range.start, range.end)} 
            style={{ backgroundColor: '#f59e0b' }} 
            className="w-full py-5 rounded-[24px] font-black text-lg shadow-xl uppercase active:scale-95 transition-transform cursor-pointer"
          >
            <SafeText color="#ffffff">{t.start || "BAŞLAT"} ({initialWords.length})</SafeText>
          </button>
        </div>
      )}

      {/* 2. PRACTICE EKRANI */}
      {view === 'practice' && currentSet.length > 0 && (
        <div className="animate-in fade-in duration-700">
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full tracking-widest">
              {fIdx + 1} / {currentSet.length}
            </span>
            <button onClick={() => setView('setup')} className="text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-colors cursor-pointer">
              {t.close || "KAPAT"}
            </button>
          </div>

          <div className="relative h-[450px]" style={{ perspective: '1200px' }}>
            <div onClick={() => setIsFlipped(!isFlipped)} className="relative w-full h-full transition-all duration-500 cursor-pointer" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <div className="absolute inset-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[48px] flex flex-col items-center justify-center p-10 text-center shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black text-white mb-8 uppercase shadow-sm" style={{ background: fTypeColors[currentSet[fIdx]?.type] || fTypeColors["DEFAULT"] }}>
                  {currentSet[fIdx]?.type}
                </span>
                <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white leading-tight">{currentSet[fIdx]?.meaning}</h2>
                <span className="absolute bottom-10 text-[10px] font-black uppercase tracking-[4px] text-slate-300 dark:text-slate-500">
                   {t.flip || "ÇEVİR"}
                </span>
              </div>
              <div className="absolute inset-0 bg-amber-500 rounded-[48px] flex flex-col items-center justify-center p-10 text-center text-white shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h2 className="text-4xl font-black italic mb-6 leading-tight tracking-tighter">{currentSet[fIdx]?.term}</h2>
                <div className="w-12 h-1 bg-white/20 rounded-full mb-6"></div>
                <p className="text-white/90 italic text-lg leading-relaxed font-medium">{currentSet[fIdx]?.example.replace('***', currentSet[fIdx]?.term)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setTimeout(() => setFIdx(fIdx - 1), 150); }} disabled={fIdx === 0} className="flex-1 py-5 rounded-[24px] font-black text-xs uppercase shadow-lg bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 cursor-pointer transition-all active:scale-95">
              {t.prev || "GERİ"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); if (fIdx < currentSet.length - 1) { setIsFlipped(false); setTimeout(() => setFIdx(fIdx + 1), 150); } else setView('summary'); }} style={{ backgroundColor: '#2563eb' }} className="flex-[2] py-5 rounded-[24px] font-black text-xs uppercase shadow-2xl active:scale-95 transition-all cursor-pointer">
              <SafeText color="#ffffff">{fIdx === currentSet.length - 1 ? (t.finish || "BİTİR") : (t.next || "İLERİ")}</SafeText>
            </button>
          </div>
        </div>
      )}

      {/* 3. SUMMARY EKRANI */}
      {view === 'summary' && (
        <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
          <div className="text-7xl mb-8">🏆</div>
          <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase italic tracking-tighter">{t.doneTitle || "TEBRİKLER"}</h2>
          <p className="text-slate-400 mb-10 font-bold italic text-sm">{currentSet.length} {t.doneDesc || "tamamlandı"}</p>
          <div className="space-y-4">
            {range.end < initialWords.length && (
              <button onClick={handleNextSet} style={{ backgroundColor: '#2563eb' }} className="w-full py-5 rounded-[24px] font-black text-xs uppercase shadow-xl active:scale-95 transition-all cursor-pointer">
                <SafeText color="#ffffff">{t.nextSet || "SIRADAKİ SET"}</SafeText>
              </button>
            )}
            <button onClick={() => launchFlashcards(range.start, range.end)} style={{ backgroundColor: '#f59e0b' }} className="w-full py-5 rounded-[24px] font-black text-xs uppercase shadow-xl active:scale-95 transition-all cursor-pointer">
              <SafeText color="#ffffff">{t.retry || "TEKRAR ET"}</SafeText>
            </button>
            <button onClick={() => setView('setup')} className="w-full py-5 rounded-[24px] font-black text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700 active:scale-95 transition-all cursor-pointer">
              {t.goHome || "ANA SAYFAYA DÖN"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}