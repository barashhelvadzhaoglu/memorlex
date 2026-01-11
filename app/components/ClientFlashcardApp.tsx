"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface Word {
  german: string;
  type: string;
  native: string;
  sentence: string;
}

interface Props {
  initialFiles: string[];
  lang: string;
  subject: string;
}

const translations: any = {
  tr: { search: "Ara...", back: "← Geri", fastSelect: "Hızlı Seç", rangeSelect: "Aralık Seç", start: "BAŞLAT", progress: "İlerleme", close: "Kapat", flip: "Çevirmek için dokun", prev: "GERİ", next: "İLERİ", finish: "BİTİR", doneTitle: "Tebrikler!", doneDesc: "kelime tamamlandı.", retry: "TEKRAR ET", changeRange: "ARALIK DEĞİŞTİR", home: "MENÜ", nextSet: "SIRADAKİ SETE GEÇ →" },
  en: { search: "Search...", back: "← Back", fastSelect: "Quick Select", rangeSelect: "Range", start: "START", progress: "Progress", close: "Close", flip: "Tap to flip", prev: "BACK", next: "NEXT", finish: "FINISH", doneTitle: "Well Done!", doneDesc: "words finished.", retry: "RETRY", changeRange: "CHANGE RANGE", home: "MENU", nextSet: "NEXT SET →" },
  // UKRAYNACA DİL DESTEĞİ EKLENDİ
  uk: { search: "Пошук...", back: "← Назад", fastSelect: "Швидкий вибір", rangeSelect: "Діапазон", start: "РОЗПОЧАТИ", progress: "Прогрес", close: "Закрити", flip: "Торкніться, щоб перевернути", prev: "НАЗАД", next: "ДАЛІ", finish: "ЗАВЕРШИТИ", doneTitle: "Чудова робота!", doneDesc: "слів вивчено.", retry: "ПОВТОРИТИ", changeRange: "ЗМІНИТИ ДІАПАЗОН", home: "МЕНЮ", nextSet: "НАСТУПНИЙ НАБІР →" }
};

export default function ClientFlashcardApp({ initialFiles, lang, subject }: Props) {
  const [view, setView] = useState<'selection' | 'setup' | 'practice' | 'summary'>('selection');
  const [fullList, setFullList] = useState<Word[]>([]);
  const [currentSet, setCurrentSet] = useState<Word[]>([]);
  const [fIdx, setFIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [range, setRange] = useState({ start: 1, end: 10 });
  const [lastRangeSize, setLastRangeSize] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');

  const t = useMemo(() => translations[lang] || translations.tr, [lang]);

  const fTypeColors: any = { 
    "İSİM": "#f59e0b", "FİİL": "#3b82f6", "SIFAT": "#ec4899", "DEFAULT": "#94a3b8" 
  };

  const shuffle = (array: Word[]) => [...array].sort(() => Math.random() - 0.5);

  const loadFile = async (fileName: string) => {
    try {
      const cleanName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
      // URL oluştururken slash yerine tire kuralına dikkat edildi
      const r = await fetch(`/wordlist/${subject}/${lang}/A1/${cleanName}`);
      if (!r.ok) throw new Error("Dosya bulunamadı.");
      const data = await r.text();
      const lines = data.split('\n').map(l => l.trim()).filter(l => l.includes(','));
      const parsed = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { german: parts[0], type: (parts[1] || "WORD").toUpperCase(), native: parts[2] || parts[0], sentence: parts[3] || "" };
      });
      setFullList(parsed);
      setRange({ start: 1, end: Math.min(10, parsed.length) });
      setView('setup');
    } catch (err: any) { setErrorMsg(err.message); }
  };

  const launchFlashcards = (start: number, end: number) => {
    setLastRangeSize(end - start + 1);
    setRange({ start, end });
    setCurrentSet(shuffle(fullList.slice(start - 1, end)));
    setFIdx(0);
    setIsFlipped(false);
    setView('practice');
  };

  const handleNextSet = () => {
    const nextStart = range.end + 1;
    const nextEnd = Math.min(nextStart + lastRangeSize - 1, fullList.length);
    if (nextStart <= fullList.length) launchFlashcards(nextStart, nextEnd);
  };

  return (
    <div className="max-w-md mx-auto p-3 sm:p-4 font-sans selection:bg-amber-200">
      
      {/* SEÇİM EKRANI */}
      {view === 'selection' && (
        <div className="space-y-3 animate-in fade-in duration-500">
          <input type="text" placeholder={t.search} className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-amber-400 dark:text-white text-sm" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />
          <div className="grid gap-2">
            {initialFiles.filter(f => f.toLowerCase().includes(searchQuery)).map(file => (
              <button key={file} onClick={() => loadFile(file)} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-amber-500 active:scale-95 transition-all text-left">
                <span className="text-xl">📚</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold text-sm uppercase tracking-tight">{file.replace('.txt', '')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KURULUM EKRANI */}
      {view === 'setup' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl text-center">
          <button onClick={() => setView('selection')} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6 block mx-auto">{t.back}</button>
          <div className="flex gap-2 justify-center mb-8">
            {[10, 15, 20].map(n => (
              <button key={n} onClick={() => launchFlashcards(1, Math.min(n, fullList.length))} className="w-12 h-12 rounded-xl border-2 border-slate-50 dark:border-slate-800 font-black text-slate-600 dark:text-slate-400 hover:border-amber-500">{n}</button>
            ))}
          </div>
          <div className="flex gap-3 justify-center items-center mb-8">
            <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-16 p-3 border dark:bg-slate-800 dark:text-white rounded-xl text-center font-bold text-lg" />
            <span className="text-slate-300">-</span>
            <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-16 p-3 border dark:bg-slate-800 dark:text-white rounded-xl text-center font-bold text-lg" />
          </div>
          <button onClick={() => launchFlashcards(range.start, range.end)} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-100 dark:shadow-none">{t.start}</button>
        </div>
      )}

      {/* ÇALIŞMA EKRANI */}
      {view === 'practice' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">{fIdx + 1} / {currentSet.length}</span>
            <button onClick={() => setView('setup')} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.close}</button>
          </div>

          <div className="relative" style={{ perspective: '1000px' }}>
            <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full min-h-[350px] transition-all duration-500 cursor-pointer shadow-2xl rounded-[40px] ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              {/* ÖN */}
              <div className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
                <span className="px-3 py-1 rounded-lg text-[9px] font-black text-white mb-6 uppercase" style={{ background: fTypeColors[currentSet[fIdx]?.type] || fTypeColors["DEFAULT"] }}>{currentSet[fIdx]?.type}</span>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4" translate="no">{currentSet[fIdx]?.native}</h2>
                <p className="text-slate-400 italic text-sm leading-relaxed max-w-[80%]" translate="no">{currentSet[fIdx]?.sentence}</p>
                <span className="absolute bottom-8 text-[9px] text-slate-300 font-bold uppercase tracking-[2px]">{t.flip}</span>
              </div>
              {/* ARKA */}
              <div className="absolute inset-0 bg-amber-500 rounded-[40px] flex flex-col items-center justify-center p-8 text-center text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h2 className="text-4xl font-black tracking-tighter mb-4" translate="no">{currentSet[fIdx]?.german}</h2>
                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => { setIsFlipped(false); setTimeout(() => setFIdx(fIdx - 1), 100); }} disabled={fIdx === 0} className="flex-1 p-4 rounded-2xl font-bold border-2 dark:text-white disabled:opacity-20 text-sm"> {t.prev} </button>
            <button onClick={() => { if (fIdx < currentSet.length - 1) { setIsFlipped(false); setTimeout(() => setFIdx(fIdx + 1), 100); } else setView('summary'); }} className="flex-[2] p-4 rounded-2xl font-black bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm shadow-lg"> {fIdx === currentSet.length - 1 ? t.finish : t.next} </button>
          </div>
        </div>
      )}

      {/* ÖZET EKRANI */}
      {view === 'summary' && (
        <div className="text-center bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl animate-in zoom-in-95">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{t.doneTitle}</h2>
          <p className="text-slate-400 mb-8 font-bold text-sm">{currentSet.length} {t.doneDesc}</p>
          <div className="space-y-3">
            {range.end < fullList.length && (
              <button onClick={handleNextSet} className="w-full p-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm shadow-lg animate-pulse">{t.nextSet}</button>
            )}
            <button onClick={() => launchFlashcards(range.start, range.end)} className="w-full p-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-lg">{t.retry}</button>
            <button onClick={() => setView('setup')} className="w-full p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm">{t.changeRange}</button>
          </div>
        </div>
      )}
    </div>
  );
}