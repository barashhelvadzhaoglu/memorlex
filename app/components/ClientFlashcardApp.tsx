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
  
  const [range, setRange] = useState({ start: 1, end: initialWords?.length || 0 });
  const [lastRangeSize, setLastRangeSize] = useState(10);

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
    <div className="max-w-4xl mx-auto p-4 font-sans transition-all duration-300">
      
      {/* 1. SETUP EKRANI - Kompakt Boyut */}
      {view === 'setup' && (
        <div className="max-w-sm mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] md:rounded-[40px] shadow-2xl text-center mt-6">
          <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6 italic opacity-70">{subject}</h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-6 italic uppercase tracking-tight">
            {t.setupLabel}
          </p>

          <div className="flex gap-2 justify-center mb-8">
            {[10, 15, 20].map(n => (
              <button 
                key={n} 
                onClick={() => {
                  setRange({ start: 1, end: n });
                  launchFlashcards(1, Math.min(n, initialWords.length));
                }} 
                className="flex-1 py-3.5 rounded-xl border-2 border-slate-50 dark:border-slate-800 font-black text-slate-600 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 transition-all cursor-pointer bg-transparent active:scale-95"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-center items-center mb-10">
            <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-20 p-3 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-center font-black text-lg text-slate-900 dark:text-white outline-none focus:ring-2 ring-amber-500/20" />
            <span className="text-slate-300 font-black">—</span>
            <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-20 p-3 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-center font-black text-lg text-slate-900 dark:text-white outline-none focus:ring-2 ring-amber-500/20" />
          </div>

          <button 
            onClick={() => launchFlashcards(range.start, range.end)} 
            className="w-full py-4 bg-amber-500 text-black rounded-2xl font-black text-lg shadow-xl uppercase active:scale-95 transition-transform cursor-pointer italic tracking-tighter"
          >
            <SafeText color="#000000">{t.start} ({initialWords.length})</SafeText>
          </button>
        </div>
      )}

      {/* 2. PRACTICE EKRANI - Kart Boyutu ve Oranı Optimize Edildi */}
      {view === 'practice' && currentSet.length > 0 && (
        <div className="max-w-md mx-auto animate-in fade-in duration-700">
          <div className="flex justify-between items-center mb-6 px-4">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full tracking-widest uppercase">
              {fIdx + 1} / {currentSet.length}
            </span>
            <button onClick={() => setView('setup')} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors cursor-pointer italic opacity-60">
              {t.close}
            </button>
          </div>

          {/* Kartın devasa olmasını engelleyen h-[380px] md:h-[420px] sınırı */}
          <div className="relative h-[380px] md:h-[420px] w-full" style={{ perspective: '1200px' }}>
            <div 
              onClick={() => setIsFlipped(!isFlipped)} 
              className="relative w-full h-full transition-all duration-700 cursor-pointer" 
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* ÖN YÜZ */}
              <div className="absolute inset-0 bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-900 rounded-[40px] md:rounded-[56px] flex flex-col items-center justify-center p-8 text-center shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                <span className="px-4 py-1 rounded-lg text-[10px] font-black text-white mb-10 uppercase italic tracking-widest" style={{ background: fTypeColors[currentSet[fIdx]?.type] || fTypeColors["DEFAULT"] }}>
                  {currentSet[fIdx]?.type}
                </span>
                <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white leading-tight tracking-tighter uppercase italic">{currentSet[fIdx]?.meaning}</h2>
                <div className="absolute bottom-10 flex flex-col items-center opacity-30">
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                      {t.flip}
                   </span>
                </div>
              </div>

              {/* ARKA YÜZ */}
              <div className="absolute inset-0 bg-amber-500 rounded-[40px] md:rounded-[56px] flex flex-col items-center justify-center p-8 text-center text-black shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h2 className="text-4xl md:text-5xl font-black italic mb-6 leading-tight tracking-tighter uppercase">{currentSet[fIdx]?.term}</h2>
                <div className="w-12 h-1 bg-black/10 rounded-full mb-6"></div>
                <p className="text-black/80 italic text-base md:text-lg leading-relaxed font-bold px-4">
                  "{currentSet[fIdx]?.example.replace('***', currentSet[fIdx]?.term)}"
                </p>
              </div>
            </div>
          </div>

          {/* Butonlar - Mobilde yan yana ve şık */}
          <div className="flex gap-3 mt-8 px-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setTimeout(() => setFIdx(fIdx - 1), 150); }} 
              disabled={fIdx === 0} 
              className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase shadow-md bg-slate-100 dark:bg-slate-900 text-slate-500 disabled:opacity-20 cursor-pointer transition-all active:scale-95 italic border-none"
            >
              {t.prev}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if (fIdx < currentSet.length - 1) { setIsFlipped(false); setTimeout(() => setFIdx(fIdx + 1), 150); } else setView('summary'); }} 
              className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl bg-slate-900 dark:bg-white text-white dark:text-black active:scale-95 transition-all cursor-pointer italic tracking-widest"
            >
              <SafeText color="inherit">{fIdx === currentSet.length - 1 ? t.finish : t.next}</SafeText>
            </button>
          </div>
        </div>
      )}

      {/* 3. SUMMARY EKRANI - Kompakt ve Temiz */}
      {view === 'summary' && (
        <div className="max-w-xs mx-auto text-center bg-white dark:bg-slate-900 p-10 rounded-[48px] border-2 border-amber-500 shadow-2xl animate-in zoom-in-95 mt-6">
          <div className="text-6xl mb-6 animate-bounce">🏆</div>
          <h2 className="text-xl font-black mb-2 text-slate-900 dark:text-white uppercase italic tracking-tighter">{t.doneTitle}</h2>
          <p className="text-slate-400 mb-8 font-bold italic text-xs tracking-tight">{currentSet.length} {t.doneDesc}</p>
          
          <div className="space-y-3">
            {range.end < initialWords.length && (
              <button onClick={handleNextSet} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all cursor-pointer italic">
                <SafeText color="#ffffff">{t.nextSet}</SafeText>
              </button>
            )}
            <button onClick={() => launchFlashcards(range.start, range.end)} className="w-full py-4 bg-amber-500 text-black rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all cursor-pointer italic">
              <SafeText color="#000000">{t.retry}</SafeText>
            </button>
            <button onClick={() => setView('setup')} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 active:scale-95 transition-all cursor-pointer italic border-none">
              {t.goHome}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}