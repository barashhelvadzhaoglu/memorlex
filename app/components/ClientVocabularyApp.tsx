"use client";

import React, { useState, useEffect, useMemo } from 'react';

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
  tr: { search: "Ünite ara...", check: "KONTROL ET", next: "SIRADAKİ", back: "Geri dön", start: "BAŞLAT", finished: "TAMAMLANDI!", retry: "SETİ TEKRARLA", main: "ANA MENÜ", nextSet: "SIRADAKİ SET →", wrongRetry: "YANLIŞLARI TEKRAR ET", fastSelect: "HIZLI SEÇİM", rangeSelect: "ARALIK SEÇ", close: "✕ KAPAT", setupLabel: "Çalışmak istediğiniz kelime sayısını seçin" },
  en: { search: "Search unit...", check: "CHECK", next: "NEXT", back: "Go back", start: "START", finished: "COMPLETED!", retry: "REPLAY SET", main: "MAIN MENU", nextSet: "NEXT SET →", wrongRetry: "RETRY MISTAKES", fastSelect: "QUICK SELECT", rangeSelect: "CHOOSE RANGE", close: "✕ CLOSE", setupLabel: "Select the number of words to study" },
  de: { search: "Lektion suchen...", check: "PRÜFEN", next: "NÄCHSTE", back: "Zurück", start: "STARTEN", finished: "ABGESCHLOSSEN!", retry: "SET WIEDERHOLEN", main: "HAUPTMENÜ", nextSet: "NÄCHSTES SET →", wrongRetry: "FEHLER WIEDERHOLEN", fastSelect: "SCHNELLAUSWAHL", rangeSelect: "BEREICH WÄHLEN", close: "✕ SCHLIESSEN", setupLabel: "Wählen Sie die Anzahl der Wörter" }
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
  const [range, setRange] = useState({ start: 1, end: initialWords?.length || 0 });
  const [lastRangeSize, setLastRangeSize] = useState(10);

  useEffect(() => {
    if (initialWords?.length > 0) {
      setRange({ start: 1, end: initialWords.length });
    }
  }, [initialWords]);

  const t = useMemo(() => {
    return dict?.vocabulary || translations[lang] || translations.tr;
  }, [dict, lang]);
  
  const fTypeColors: any = { 
    "İsim": "#f59e0b", "Noun": "#f59e0b",
    "Fiil": "#3b82f6", "Verb": "#3b82f6",
    "Sıfat": "#ec4899", "Adjective": "#ec4899",
    "Zarf": "#10b981", "Adverb": "#10b981",
    "DEFAULT": "#94a3b8" 
  };

  const germanChars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  const launchGame = (start: number, end: number) => {
    const size = end - start + 1;
    setLastRangeSize(size);
    setRange({ start, end });
    const sliced = initialWords.slice(start - 1, end);
    setCurrentSet(shuffle(sliced));
    setIdx(0);
    setStats({ correct: 0, wrong: 0 });
    setErrorWords([]);
    setAnswered(false);
    setUserInput('');
    setFeedback({ text: '', color: '' });
    setView('practice');
  };

  const handleNextSet = () => {
    const nextStart = range.end + 1;
    const nextEnd = Math.min(nextStart + lastRangeSize - 1, initialWords.length);
    if (nextStart <= initialWords.length) {
      launchGame(nextStart, nextEnd);
    }
  };

  const handleCharClick = (char: string) => {
    setUserInput(prev => prev + char);
    document.getElementById('word-input')?.focus();
  };

  const handleCheck = () => {
    if (answered) return;
    const w = currentSet[idx];
    const userValue = userInput.trim();
    if (!userValue) return;

    let isCorrect = false;
    const isNoun = w.type === "İsim" || w.type === "Noun";

    if (isNoun) {
      isCorrect = userValue === w.term;
    } else {
      isCorrect = userValue.toLowerCase() === w.term.toLowerCase();
    }

    if (isCorrect) {
      setAnswered(true);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setFeedback({ text: 'Richtig! 🎉', color: '#16a34a' });
      setTimeout(() => {
          const nextBtn = document.getElementById('next-btn-trigger');
          if (nextBtn) nextBtn.click();
      }, 800);
      return;
    }

    setAnswered(true);
    setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    setErrorWords(prev => [...prev, w]);
    setFeedback({ text: `Falsch: ${w.term}`, color: '#dc2626' });
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

  const SafeText = ({ children, color }: { children: any, color: string }) => (
    <span style={{ color: `${color} !important`, display: 'block', width: '100%', opacity: 1 }}>
      {children}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-10 font-sans transition-all duration-300">
      
      {/* SETUP EKRANI - Maksimum genişlik daraltıldı */}
      {view === 'setup' && (
        <div className="max-w-sm mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 text-center mt-6 md:mt-10">
          <h1 className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-4 italic uppercase">{subject}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-6 italic opacity-70 uppercase tracking-tight">{t.setupLabel}</p>
          
          <div className="flex gap-2 mb-6">
            {[10, 15, 20].map(n => (
              <button key={n} onClick={() => launchGame(1, Math.min(n, initialWords.length))} 
                className="flex-1 py-3 border-2 border-slate-100 dark:border-white/10 rounded-xl font-black text-slate-600 dark:text-slate-200 hover:border-amber-500 hover:text-amber-500 transition-all cursor-pointer bg-transparent active:scale-95">
                {n}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex gap-2 justify-center items-center">
              <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-20 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center font-black dark:text-white outline-none border border-transparent focus:border-amber-500" />
              <span className="text-slate-300 dark:text-slate-600 font-black">—</span>
              <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-20 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center font-black dark:text-white outline-none border border-transparent focus:border-amber-500" />
            </div>
          </div>

          <button onClick={() => launchGame(range.start, range.end)} className="w-full py-4 bg-amber-500 text-black rounded-2xl font-black text-lg shadow-xl uppercase cursor-pointer transition-transform active:scale-95 italic tracking-tighter">
             <SafeText color="#000000">{t.start} ({initialWords.length})</SafeText>
          </button>
        </div>
      )}

      {/* PRACTICE EKRANI - Kart boyutu ve padding ayarlandı */}
      {view === 'practice' && (
        <div className="max-w-md md:max-w-xl mx-auto bg-white dark:bg-slate-950 p-6 md:p-10 rounded-[40px] md:rounded-[56px] shadow-2xl border-2 border-slate-50 dark:border-slate-900 mt-2 md:mt-6 text-center">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-600 mb-8 uppercase tracking-[0.2em]">
            <span className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full">{idx + 1} / {currentSet.length}</span>
            <button onClick={() => setView('setup')} className="hover:text-red-500 transition-colors cursor-pointer font-black uppercase opacity-60 italic">{t.close}</button>
          </div>

          <div className="flex justify-center mb-6">
            <span className="px-4 py-1 rounded-lg text-[10px] font-black text-white uppercase italic tracking-widest" style={{ backgroundColor: fTypeColors[currentSet[idx]?.type] || fTypeColors["DEFAULT"] }}>
              {currentSet[idx]?.type}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter leading-tight italic uppercase">{currentSet[idx]?.meaning}</h2>
          
          <p className="text-slate-400 dark:text-slate-500 italic mb-8 text-base font-medium opacity-80 leading-relaxed px-4">
            {currentSet[idx]?.example.replace('***', '______')}
          </p>

          {/* Karakter butonları mobilde daha kompakt */}
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-8">
            {germanChars.map(char => (
              <button key={char} onClick={() => handleCharClick(char)} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-amber-500 hover:text-black dark:text-white rounded-xl font-black text-lg transition-all active:scale-90 cursor-pointer border-none shadow-sm">
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
            className="w-full max-w-sm mx-auto block p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center text-xl md:text-2xl font-black dark:text-white outline-none border-2 border-transparent focus:border-amber-500 mb-8 transition-all" 
            placeholder="..." 
            autoComplete="off" 
            autoCorrect="off" 
            spellCheck="false" 
          />

          <div className="flex gap-3 max-w-sm mx-auto">
            <button onClick={handleCheck} className="flex-[1.5] py-4 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-tighter shadow-lg cursor-pointer transition-all active:scale-95 italic">
               <SafeText color="#000000">{t.check}</SafeText>
            </button>
            
            <button id="next-btn-trigger" onClick={handleNext} className="flex-1 py-4 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase tracking-tighter shadow-lg cursor-pointer transition-all active:scale-95 border-none italic text-xs">
               <SafeText color="inherit">{idx === currentSet.length - 1 ? t.finished : t.next}</SafeText>
            </button>
          </div>

          <div style={{ color: feedback.color }} className="mt-6 font-black text-lg min-h-[1.5em] italic tracking-tight opacity-90">
            {feedback.text}
          </div>
        </div>
      )}

      {/* RESULT EKRANI - Daha kompakt yapı */}
      {view === 'result' && (
        <div className="max-w-xs mx-auto text-center p-8 bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border-2 border-amber-500 mt-6 md:mt-10">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 italic uppercase tracking-tighter">{t.finished}</h2>
          
          <div className="flex flex-col gap-2.5">
            {errorWords.length > 0 && (
              <button 
                onClick={() => { 
                  const errors = [...errorWords];
                  setCurrentSet(shuffle(errors)); 
                  setIdx(0); 
                  setErrorWords([]); 
                  setStats({ correct: 0, wrong: 0 });
                  setAnswered(false);
                  setUserInput('');
                  setFeedback({ text: '', color: '' });
                  setView('practice'); 
                }} 
                className="py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 italic"
              >
                <SafeText color="#ffffff">{t.wrongRetry} ({errorWords.length})</SafeText>
              </button>
            )}

            {range.end < initialWords.length && (
              <button onClick={handleNextSet} className="py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 border-none italic">
                <SafeText color="#ffffff">{t.nextSet}</SafeText>
              </button>
            )}

            <button onClick={() => launchGame(range.start, range.end)} className="py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 border-none italic">
              <SafeText color="#ffffff">{t.retry}</SafeText>
            </button>

            <button onClick={() => setView('setup')} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 border-none italic">
              <SafeText color="#ffffff">{t.main}</SafeText>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}