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
  de: { search: "Lektion suchen...", check: "PRÜFEN", next: "NÄCHSTE", back: "Zurück", start: "STARTEN", finished: "ABGESCHLOSSEN!", retry: "SET WIEDERHOLEN", main: "HAUPTMENÜ", nextSet: "NÄCHSTES SET →", wrongRetry: "FEHLER WIEDERHOLEN", fastSelect: "SCHNELLAUSWAHL", rangeSelect: "BEREICH WÄHLEN", close: "✕ SCHLIESSEN", setupLabel: "Wählen Sie die Anzahl der Wörter" },
  // ✅ İspanyolca (es) eklendi
  es: { search: "Buscar unidad...", check: "COMPROBAR", next: "SIGUIENTE", back: "Volver", start: "INICIAR", finished: "¡COMPLETADO!", retry: "REPETIR SET", main: "MENÚ PRINCIPAL", nextSet: "SIGUIENTE SET →", wrongRetry: "REPETIR ERRORES", fastSelect: "SELECCIÓN RÁPIDA", rangeSelect: "ELEGIR RANGO", close: "✕ CERRAR", setupLabel: "Selecciona el número de palabras para estudiar" }
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
    "İsim": "#f59e0b", "Noun": "#f59e0b", "Sustantivo": "#f59e0b",
    "Fiil": "#3b82f6", "Verb": "#3b82f6", "Verbo": "#3b82f6",
    "Sıfat": "#ec4899", "Adjective": "#ec4899", "Adjetivo": "#ec4899",
    "Zarf": "#10b981", "Adverb": "#10b981", "Adverbio": "#10b981",
    "DEFAULT": "#94a3b8" 
  };

  // ✅ Öğrenilen dile göre klavye karakterlerini belirle
  const specialChars = useMemo(() => {
    if (subject === "german") return ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];
    if (subject === "spanish") return ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'];
    return [];
  }, [subject]);

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
    // İsimlerde artikeller önemli olduğu için case-sensitive kontrol edilebilir
    const isNoun = w.type === "İsim" || w.type === "Noun" || w.type === "Sustantivo";

    if (isNoun) {
      isCorrect = userValue === w.term;
    } else {
      isCorrect = userValue.toLowerCase() === w.term.toLowerCase();
    }

    if (isCorrect) {
      setAnswered(true);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      const correctMsg = lang === "tr" ? "Doğru! 🎉" : lang === "es" ? "¡Correcto! 🎉" : lang === "de" ? "Richtig! 🎉" : "Correct! 🎉";
      setFeedback({ text: correctMsg, color: '#16a34a' });
      setTimeout(() => {
          const nextBtn = document.getElementById('next-btn-trigger');
          if (nextBtn) nextBtn.click();
      }, 800);
      return;
    }

    setAnswered(true);
    setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    setErrorWords(prev => [...prev, w]);
    const wrongMsg = lang === "tr" ? "Yanlış" : lang === "es" ? "Incorrecto" : lang === "de" ? "Falsch" : "Wrong";
    setFeedback({ text: `${wrongMsg}: ${w.term}`, color: '#dc2626' });
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
    <div className="max-w-md mx-auto px-4 pb-10 font-sans">
      
      {/* SETUP EKRANI */}
      {view === 'setup' && (
        <div className="bg-white dark:bg-[#0b1120] p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 text-center mt-6">
          <h1 className="text-[10px] font-bold text-slate-400 tracking-widest mb-4 italic uppercase">{subject}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-4 italic">{t.setupLabel}</p>
          <div className="flex gap-2 mb-6">
            {[10, 15, 20].map(n => (
              <button key={n} onClick={() => launchGame(1, Math.min(n, initialWords.length))} 
                className="flex-1 py-3 border-2 border-slate-100 dark:border-white/10 rounded-xl font-bold text-slate-600 dark:text-slate-200 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer bg-transparent">
                {n}
              </button>
            ))}
          </div>
          <div className="mb-6">
            <div className="flex gap-2 justify-center items-center">
              <input type="number" value={range.start} onChange={e => setRange({...range, start: Number(e.target.value)})} className="w-16 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center font-bold dark:text-white outline-none border border-transparent focus:border-blue-500" />
              <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
              <input type="number" value={range.end} onChange={e => setRange({...range, end: Number(e.target.value)})} className="w-16 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center font-bold dark:text-white outline-none border border-transparent focus:border-blue-500" />
            </div>
          </div>
          <button onClick={() => launchGame(range.start, range.end)} className="w-full py-4 bg-[#2563eb] text-white rounded-[20px] font-black text-base shadow-xl uppercase cursor-pointer transition-transform active:scale-95">
             <SafeText color="#ffffff">{t.start} ({initialWords.length})</SafeText>
          </button>
        </div>
      )}

      {/* PRACTICE EKRANI */}
      {view === 'practice' && (
        <div className="bg-white dark:bg-[#0b1120] p-6 md:p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 mt-4 text-center">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-widest">
            <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full">{idx + 1} / {currentSet.length}</span>
            <button onClick={() => setView('setup')} className="hover:text-red-500 transition-colors cursor-pointer font-bold uppercase">{t.close}</button>
          </div>
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase" style={{ backgroundColor: fTypeColors[currentSet[idx]?.type] || fTypeColors["DEFAULT"] }}>
              {currentSet[idx]?.type}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight leading-tight uppercase italic">{currentSet[idx]?.meaning}</h2>
          <p className="text-slate-400 dark:text-slate-500 italic mb-6 text-base font-normal">{currentSet[idx]?.example.replace('***', '______')}</p>
          
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {specialChars.map(char => (
              <button key={char} onClick={() => handleCharClick(char)} className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-white/10 hover:bg-blue-600 hover:text-white dark:text-white rounded-lg font-bold text-lg transition-all active:scale-90 cursor-pointer">{char}</button>
            ))}
          </div>

          <input id="word-input" autoFocus type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center text-xl font-bold dark:text-white outline-none border-2 border-transparent focus:border-blue-500 mb-6" placeholder="..." autoComplete="off" autoCorrect="off" spellCheck="false" />
          
          <div className="flex gap-3">
            <button onClick={handleCheck} className="flex-[2] py-3.5 bg-[#2563eb] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg cursor-pointer transition-all active:scale-95">
               <SafeText color="#ffffff">{t.check}</SafeText>
            </button>
            <button id="next-btn-trigger" onClick={handleNext} className="flex-1 py-3.5 bg-[#eab308] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg cursor-pointer transition-all active:scale-95 border-none">
               <SafeText color="#ffffff">{idx === currentSet.length - 1 ? t.finished : t.next}</SafeText>
            </button>
          </div>
          <div style={{ color: feedback.color }} className="mt-4 font-bold text-lg min-h-[1.5em] italic">{feedback.text}</div>
        </div>
      )}

      {/* RESULT EKRANI */}
      {view === 'result' && (
        <div className="max-w-xs mx-auto text-center p-8 bg-white dark:bg-[#161d2f] rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 mt-6">
          <div className="text-6xl mb-6">🏆</div>
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
                className="py-3.5 bg-[#f59e0b] text-white rounded-xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <SafeText color="#ffffff">{t.wrongRetry} ({errorWords.length})</SafeText>
              </button>
            )}

            {range.end < initialWords.length && (
              <button onClick={handleNextSet} className="py-3.5 bg-[#16a34a] text-white rounded-xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 border-none">
                <SafeText color="#ffffff">{t.nextSet}</SafeText>
              </button>
            )}

            <button onClick={() => launchGame(range.start, range.end)} className="py-3.5 bg-[#ef4444] text-white rounded-xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 border-none">
              <SafeText color="#ffffff">{t.retry}</SafeText>
            </button>

            <button onClick={() => setView('setup')} className="py-3.5 bg-[#8b5cf6] text-white rounded-xl font-black text-xs uppercase shadow-lg cursor-pointer transition-all active:scale-95 border-none">
              <SafeText color="#ffffff">{t.main}</SafeText>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}