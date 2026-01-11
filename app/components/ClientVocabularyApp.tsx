"use client";

import React, { useState } from 'react';

interface Word {
  german: string;
  type: string;
  native: string;
  sentence: string;
}

interface Props {
  initialFiles: string[];
  dict: any;
  lang: string;
  subject: string;
}

// DİL ÇEVİRİLERİ (Fonksiyon dışına eklendi)
const translations: any = {
  tr: { search: "Ünite ara...", check: "KONTROL ET", next: "SIRADAKİ", back: "GERİ DÖ", start: "BAŞLAT", finished: "TAMAMLANDI!", retry: "SETİ TEKRARLA", main: "ANA MENÜ", nextSet: "YENİ SETE GEÇ", wrongRetry: "YANLIŞLARI TEKRAR ET", fastSelect: "HIZLI SEÇİM", rangeSelect: "ARALIK SEÇ", close: "✕ KAPAT" },
  en: { search: "Search unit...", check: "CHECK", next: "NEXT", back: "GO BACK", start: "START", finished: "COMPLETED!", retry: "REPLAY SET", main: "MAIN MENU", nextSet: "NEXT SET", wrongRetry: "RETRY MISTAKES", fastSelect: "QUICK SELECT", rangeSelect: "CHOOSE RANGE", close: "✕ CLOSE" },
  de: { search: "Lektion suchen...", check: "PRÜFEN", next: "NÄCHSTE", back: "ZURÜCK", start: "STARTEN", finished: "ABGESCHLOSSEN!", retry: "SET WIEDERHOLEN", main: "HAUPTMENÜ", nextSet: "NÄCHSTES SET", wrongRetry: "FEHLER WIEDERHOLEN", fastSelect: "SCHNELLAUSWAHL", rangeSelect: "BEREICH WÄHLEN", close: "✕ SCHLIESSEN" },
  uk: { search: "Пошук...", check: "ПЕРЕВІРИТИ", next: "ДАЛІ", back: "НАЗАД", start: "ПОЧАТИ", finished: "ЗАВЕРШЕНО!", retry: "ПОВТОРИТИ", main: "ГОЛОВНЕ МЕНЮ", nextSet: "НАСТУПНИЙ НАБІР", wrongRetry: "ПОВТОРИТИ ПОМИЛКИ", fastSelect: "ШВИДКИЙ ВИБІР", rangeSelect: "ВИБРАТИ ДІАПАЗОН", close: "✕ ЗАКРИТИ" }
};

export default function ClientVocabularyApp({ initialFiles, lang, subject, dict }: Props) {
  const [view, setView] = useState<'selection' | 'setup' | 'practice' | 'result'>('selection');
  const [fullList, setFullList] = useState<Word[]>([]);
  const [currentSet, setCurrentSet] = useState<Word[]>([]);
  const [errorWords, setErrorWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [answered, setAnswered] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string, color: string }>({ text: '', color: '' });
  const [range, setRange] = useState({ start: 1, end: 10 });
  const [searchQuery, setSearchQuery] = useState('');

  // Aktif dilin metinlerini seçiyoruz
  const t = translations[lang] || translations.tr;

  const shuffle = (array: any[]) => {
    let cur = array.length, rand;
    const newArr = [...array];
    while (cur !== 0) {
      rand = Math.floor(Math.random() * cur);
      cur--;
      [newArr[cur], newArr[rand]] = [newArr[rand], newArr[cur]];
    }
    return newArr;
  };

  const loadFile = async (fileName: string) => {
    const cleanPath = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    try {
      const r = await fetch(`/wordlist/${subject}/${lang}/A1/${cleanPath}`);
      if (!r.ok) throw new Error("File not found");
      const data = await r.text();
      const lines = data.split('\n').filter(l => l.trim() && l.includes(','));
      const parsed = lines.map(l => {
        const p = l.split(',').map(x => x.trim());
        return { 
          german: p[0], 
          type: p[1] ? p[1].toUpperCase() : "", 
          native: p[2] || p[1], 
          sentence: p[3] || p[2] || "" 
        };
      });
      setFullList(parsed);
      setRange({ start: 1, end: Math.min(10, parsed.length) });
      setView('setup');
    } catch (err) {
      console.error("Error loading file:", err);
    }
  };

  const launchGame = (set: Word[]) => {
    setCurrentSet(set);
    setIdx(0);
    setStats({ correct: 0, wrong: 0 });
    setErrorWords([]);
    setAnswered(false);
    setUserInput('');
    setFeedback({ text: '', color: '' });
    setView('practice');
  };

  const handleCheck = () => {
    if (answered) return;
    const w = currentSet[idx];
    const a = userInput.trim();
    if (!a) return;
    setAnswered(true);
    if (a.toLowerCase() === w.german.toLowerCase()) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setFeedback({ text: 'Richtig! 🎉', color: '#16a34a' });
      setTimeout(() => document.getElementById('next-btn-trigger')?.click(), 800);
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setErrorWords(prev => [...prev, w]);
      setFeedback({ text: `Falsch: ${w.german}`, color: '#dc2626' });
    }
  };

  const handleNext = () => {
    if (!answered) {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setErrorWords(prev => [...prev, currentSet[idx]]);
    }
    if (idx + 1 < currentSet.length) {
      setIdx(prev => prev + 1);
      setAnswered(false);
      setUserInput('');
      setFeedback({ text: '', color: '' });
    } else {
      setView('result');
    }
  };

  const nextSet = () => {
    const setSize = range.end - range.start + 1;
    const newStart = range.end + 1;
    let newEnd = newStart + setSize - 1;
    if (newStart > fullList.length) {
      setView('selection');
      return;
    }
    if (newEnd > fullList.length) newEnd = fullList.length;
    setRange({ start: newStart, end: newEnd });
    launchGame(shuffle(fullList.slice(newStart - 1, newEnd)));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10 dark:text-white">
      
      {view === 'selection' && (
        <div className="animate-in fade-in duration-500">
          <h1 className="text-2xl md:text-3xl font-black text-center mb-8 uppercase text-slate-800 dark:text-white pt-4">
            {subject}
          </h1>
          <div className="relative mb-8 max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder={t.search} 
              className="w-full p-4 pl-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-white outline-none"
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {initialFiles.filter(f => f.toLowerCase().includes(searchQuery)).map(file => (
              <button 
                key={file} 
                onClick={() => loadFile(file)}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all text-center"
              >
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  {file.replace('.txt', '').replace(/_/g, ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'setup' && (
        <div className="max-w-md mx-auto bg-white dark:bg-[#111827] p-8 rounded-[40px] shadow-2xl border border-slate-50 dark:border-slate-800 text-center mt-10">
          <button onClick={() => setView('selection')} className="text-slate-400 dark:text-slate-300 hover:text-blue-500 mb-6 text-[11px] font-black uppercase tracking-widest transition-colors">
            ← {t.back}
          </button>
          
          <div className="mb-8">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4">{t.fastSelect}</p>
            <div className="flex gap-2">
              {[10, 20, 50].map(n => (
                <button key={n} onClick={() => { setRange({start: 1, end: Math.min(n, fullList.length)}); launchGame(shuffle(fullList.slice(0, Math.min(n, fullList.length)))); }} 
                  className="flex-1 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4">{t.rangeSelect}</p>
            <div className="flex gap-3 justify-center items-center">
              <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-24 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center font-black dark:text-white border border-transparent focus:border-blue-500 outline-none" />
              <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
              <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-24 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center font-black dark:text-white border border-transparent focus:border-blue-500 outline-none" />
            </div>
          </div>

          <button onClick={() => launchGame(shuffle(fullList.slice(range.start - 1, range.end)))} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-black text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            {t.start}
          </button>
        </div>
      )}

      {view === 'practice' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border dark:border-slate-800 mt-4 text-center">
          <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6">
            <span>{idx + 1} - {currentSet.length}</span>
            <button onClick={() => setView('selection')}>{t.close}</button>
          </div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">{currentSet[idx]?.native}</h2>
          <p className="text-slate-400 dark:text-slate-500 italic mb-8">{currentSet[idx]?.sentence}</p>
          <input 
            autoFocus
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-2xl font-bold dark:text-white outline-none border-2 border-transparent focus:border-blue-500 mb-6"
            placeholder="..."
          />
          <div className="flex gap-3">
            <button onClick={handleCheck} className="flex-[2] py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black">{t.check}</button>
            <button id="next-btn-trigger" onClick={handleNext} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black">{t.next}</button>
          </div>
          <div style={{ color: feedback.color }} className="mt-6 font-black text-xl">{feedback.text}</div>
        </div>
      )}

      {view === 'result' && (
        <div className="max-w-sm mx-auto text-center p-10 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border dark:border-slate-800 mt-4">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">{t.finished}</h2>
          <div className="flex flex-col gap-3">
            {errorWords.length > 0 && (
              <button onClick={() => launchGame(shuffle(errorWords))} className="py-4 bg-orange-500 text-white rounded-2xl font-black text-sm">{t.wrongRetry} ({errorWords.length})</button>
            )}
            {range.end < fullList.length && (
              <button onClick={nextSet} className="py-4 bg-green-500 text-white rounded-2xl font-black text-sm uppercase">{t.nextSet}</button>
            )}
            <button onClick={() => launchGame(shuffle(currentSet))} className="py-4 bg-blue-500 text-white rounded-2xl font-black text-sm uppercase">{t.retry}</button>
            <button onClick={() => setView('selection')} className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm uppercase">{t.main}</button>
          </div>
        </div>
      )}
    </div>
  );
}