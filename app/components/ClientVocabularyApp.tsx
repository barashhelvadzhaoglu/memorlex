"use client";

import React, { useState, useEffect } from 'react';

// Senin JSON yapındaki isimler ve yeni çok dilli yapı
interface Word {
  term: string;    
  type: string;
  meaning: string; 
  example: string; 
  [key: string]: any; // meaning_tr, meaning_en gibi dinamik alanlar için
}

interface Props {
  initialWords: Word[];
  lang: string;
  subject: string;
  dict: any; 
}

const translations: any = {
  tr: { search: "Ünite ara...", check: "KONTROL ET", next: "SIRADAKİ", back: "GERİ DÖ", start: "BAŞLAT", finished: "TAMAMLANDI!", retry: "SETİ TEKRARLA", main: "ANA MENÜ", nextSet: "YENİ SETE GEÇ", wrongRetry: "YANLIŞLARI TEKRAR ET", fastSelect: "HIZLI SEÇİM", rangeSelect: "ARALIK SEÇ", close: "✕ KAPAT" },
  en: { search: "Search unit...", check: "CHECK", next: "NEXT", back: "GO BACK", start: "START", finished: "COMPLETED!", retry: "REPLAY SET", main: "MAIN MENU", nextSet: "NEXT SET", wrongRetry: "RETRY MISTAKES", fastSelect: "QUICK SELECT", rangeSelect: "CHOOSE RANGE", close: "✕ CLOSE" },
  de: { search: "Lektion suchen...", check: "PRÜFEN", next: "NÄCHSTE", back: "ZURÜCK", start: "STARTEN", finished: "ABGESCHLOSSEN!", retry: "SET WIEDERHOLEN", main: "HAUPTMENÜ", nextSet: "NÄCHSTES SET", wrongRetry: "FEHLER WIEDERHOLEN", fastSelect: "SCHNELLAUSWAHL", rangeSelect: "BEREICH WÄHLEN", close: "✕ SCHLIESSEN" },
  uk: { search: "Пошук...", check: "ПЕРЕВІРИТИ", next: "ДАЛІ", back: "НАЗАД", start: "ПОЧАТИ", finished: "ЗАВЕРШЕНО!", retry: "ПОВТОРИТИ", main: "ГОЛОВНЕ МЕНЮ", nextSet: "НАСТУПНИЙ СЕТ", wrongRetry: "ПОВТОРИТИ ПОМИЛКИ", fastSelect: "ШВИДКИЙ ВИБІР", rangeSelect: "ОБРАТИ ДІАПАЗОН", close: "✕ ЗАКРИТИ" }
};

export default function ClientVocabularyApp({ initialWords, lang, subject, dict }: Props) {
  const [view, setView] = useState<'setup' | 'practice' | 'result'>('setup');
  const [currentSet, setCurrentSet] = useState<Word[]>([]);
  const [errorWords, setErrorWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [answered, setAnswered] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string, color: string }>({ text: '', color: '' });
  const [range, setRange] = useState({ start: 1, end: Math.min(10, initialWords?.length || 0) });

  const t = dict?.vocabulary || translations[lang] || translations.tr;
  
  // Almanca Özel Karakterler
  const germanChars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

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

  const handleCharClick = (char: string) => {
    setUserInput(prev => prev + char);
    // İnputa odağı geri ver
    document.getElementById('word-input')?.focus();
  };

  const handleCheck = () => {
    if (answered) return;
    const w = currentSet[idx];
    const a = userInput.trim();
    if (!a) return;
    setAnswered(true);

    if (a.toLowerCase() === w.term.toLowerCase()) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setFeedback({ text: 'Richtig! 🎉', color: '#16a34a' });
      setTimeout(() => document.getElementById('next-btn-trigger')?.click(), 800);
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setErrorWords(prev => [...prev, w]);
      setFeedback({ text: `Falsch: ${w.term}`, color: '#dc2626' });
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
    if (newStart > initialWords.length) {
      setView('setup');
      return;
    }
    if (newEnd > initialWords.length) newEnd = initialWords.length;
    setRange({ start: newStart, end: newEnd });
    launchGame(shuffle(initialWords.slice(newStart - 1, newEnd)));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10 dark:text-white transition-colors duration-300">
      
      {view === 'setup' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 text-center mt-10 transition-all">
          <h1 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-6 italic">{subject}</h1>
          
          <div className="mb-8">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.fastSelect}</p>
            <div className="flex gap-2">
              {/* Burayı 10, 15, 20 olarak güncelledim */}
              {[10, 15, 20].map(n => (
                <button key={n} onClick={() => { setRange({start: 1, end: Math.min(n, initialWords.length)}); launchGame(shuffle(initialWords.slice(0, Math.min(n, initialWords.length)))); }} 
                  className="flex-1 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-slate-600 dark:text-slate-200 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all active:scale-95">
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.rangeSelect}</p>
            <div className="flex gap-3 justify-center items-center">
              <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-24 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center font-black dark:text-white border border-transparent focus:border-blue-500 outline-none transition-all" />
              <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
              <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-24 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center font-black dark:text-white border border-transparent focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <button onClick={() => launchGame(shuffle(initialWords.slice(range.start - 1, range.end)))} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-black text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-tighter">
            {t.start}
          </button>
        </div>
      )}

      {view === 'practice' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 mt-4 text-center transition-all">
          <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase">
            <span>{idx + 1} / {currentSet.length}</span>
            <button onClick={() => setView('setup')} className="hover:text-red-500 transition-colors uppercase tracking-widest">{t.close}</button>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight leading-tight uppercase">
            {currentSet[idx]?.meaning}
          </h2>
          
          <p className="text-slate-400 dark:text-slate-500 italic mb-6 text-lg">
            {currentSet[idx]?.example.replace('***', '______')}
          </p>

          {/* Almanca Karakter Butonları */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {germanChars.map(char => (
              <button
                key={char}
                onClick={() => handleCharClick(char)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:text-white rounded-xl font-bold text-xl transition-all active:scale-90 border border-transparent dark:border-slate-700"
              >
                {char}
              </button>
            ))}
          </div>

          <input 
            id="word-input"
            autoFocus
            type="text" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-2xl font-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500 mb-6 transition-all"
            placeholder="..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          <div className="flex gap-3">
            <button onClick={handleCheck} className="flex-[2] py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">{t.check}</button>
            <button id="next-btn-trigger" onClick={handleNext} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">{t.next}</button>
          </div>

          <div style={{ color: feedback.color }} className="mt-6 font-black text-xl min-h-[1.5em]">
            {feedback.text}
          </div>
        </div>
      )}

      {view === 'result' && (
        <div className="max-w-sm mx-auto text-center p-10 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 mt-4 transition-all">
          <div className="text-5xl mb-6 animate-bounce">🏆</div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 italic uppercase tracking-tighter">{t.finished}</h2>
          
          <div className="flex flex-col gap-3">
            {errorWords.length > 0 && (
              <button onClick={() => launchGame(shuffle(errorWords))} className="py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase transition-colors shadow-lg">
                {t.wrongRetry} ({errorWords.length})
              </button>
            )}
            {range.end < initialWords.length && (
              <button onClick={nextSet} className="py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm uppercase transition-colors shadow-lg">{t.nextSet}</button>
            )}
            <button onClick={() => launchGame(shuffle(currentSet))} className="py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase transition-colors shadow-lg">{t.retry}</button>
            <button onClick={() => setView('setup')} className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{t.main}</button>
          </div>
        </div>
      )}
    </div>
  );
}