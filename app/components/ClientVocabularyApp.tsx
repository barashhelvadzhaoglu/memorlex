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
  es: { search: "Buscar unidad...", check: "COMPROBAR", next: "SIGUIENTE", back: "Volver", start: "INICIAR", finished: "¡COMPLETADO!", retry: "REPETIR SET", main: "MENÚ PRINCIPAL", nextSet: "SIGUIENTE SET →", wrongRetry: "REPETIR ERRORES", fastSelect: "SELECCIÓN RÁPIDA", rangeSelect: "ELEGIR RANGO", close: "✕ CERRAR", setupLabel: "Selecciona el número de palabras para estudiar" }
};

// --- Tür renkleri: light/dark modda farklı bg ve text değerleri ---
const typeStyles: Record<string, { light: string; dark: string; dot: string }> = {
  // İsim / Noun / Sustantivo / Nomen
  "İsim":       { light: "bg-amber-100 text-amber-800",   dark: "dark:bg-amber-900/40 dark:text-amber-300",   dot: "bg-amber-500" },
  "Noun":       { light: "bg-amber-100 text-amber-800",   dark: "dark:bg-amber-900/40 dark:text-amber-300",   dot: "bg-amber-500" },
  "Sustantivo": { light: "bg-amber-100 text-amber-800",   dark: "dark:bg-amber-900/40 dark:text-amber-300",   dot: "bg-amber-500" },
  "Nomen":      { light: "bg-amber-100 text-amber-800",   dark: "dark:bg-amber-900/40 dark:text-amber-300",   dot: "bg-amber-500" },
  // Fiil / Verb / Verbo
  "Fiil":       { light: "bg-blue-100 text-blue-800",     dark: "dark:bg-blue-900/40 dark:text-blue-300",     dot: "bg-blue-500" },
  "Verb":       { light: "bg-blue-100 text-blue-800",     dark: "dark:bg-blue-900/40 dark:text-blue-300",     dot: "bg-blue-500" },
  "Verbo":      { light: "bg-blue-100 text-blue-800",     dark: "dark:bg-blue-900/40 dark:text-blue-300",     dot: "bg-blue-500" },
  // Sıfat / Adjective / Adjetivo / Adjektiv
  "Sıfat":      { light: "bg-pink-100 text-pink-800",     dark: "dark:bg-pink-900/40 dark:text-pink-300",     dot: "bg-pink-500" },
  "Adjective":  { light: "bg-pink-100 text-pink-800",     dark: "dark:bg-pink-900/40 dark:text-pink-300",     dot: "bg-pink-500" },
  "Adjetivo":   { light: "bg-pink-100 text-pink-800",     dark: "dark:bg-pink-900/40 dark:text-pink-300",     dot: "bg-pink-500" },
  "Adjektiv":   { light: "bg-pink-100 text-pink-800",     dark: "dark:bg-pink-900/40 dark:text-pink-300",     dot: "bg-pink-500" },
  // Zarf / Adverb / Adverbio
  "Zarf":       { light: "bg-emerald-100 text-emerald-800", dark: "dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  "Adverb":     { light: "bg-emerald-100 text-emerald-800", dark: "dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  "Adverbio":   { light: "bg-emerald-100 text-emerald-800", dark: "dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  // Zamir / Pronoun / Pronombre
  "Zamir":      { light: "bg-violet-100 text-violet-800", dark: "dark:bg-violet-900/40 dark:text-violet-300", dot: "bg-violet-500" },
  "Pronoun":    { light: "bg-violet-100 text-violet-800", dark: "dark:bg-violet-900/40 dark:text-violet-300", dot: "bg-violet-500" },
  "Pronombre":  { light: "bg-violet-100 text-violet-800", dark: "dark:bg-violet-900/40 dark:text-violet-300", dot: "bg-violet-500" },
  // Edat / Preposition / Preposición
  "Edat":       { light: "bg-cyan-100 text-cyan-800",     dark: "dark:bg-cyan-900/40 dark:text-cyan-300",     dot: "bg-cyan-500" },
  "Preposition":{ light: "bg-cyan-100 text-cyan-800",     dark: "dark:bg-cyan-900/40 dark:text-cyan-300",     dot: "bg-cyan-500" },
  "Preposición":{ light: "bg-cyan-100 text-cyan-800",     dark: "dark:bg-cyan-900/40 dark:text-cyan-300",     dot: "bg-cyan-500" },
  // Bağlaç / Conjunction / Conjunción
  "Bağlaç":     { light: "bg-rose-100 text-rose-800",     dark: "dark:bg-rose-900/40 dark:text-rose-300",     dot: "bg-rose-500" },
  "Conjunction":{ light: "bg-rose-100 text-rose-800",     dark: "dark:bg-rose-900/40 dark:text-rose-300",     dot: "bg-rose-500" },
  "Conjunción": { light: "bg-rose-100 text-rose-800",     dark: "dark:bg-rose-900/40 dark:text-rose-300",     dot: "bg-rose-500" },
  // Ünlem / Interjection
  "Ünlem":      { light: "bg-orange-100 text-orange-800", dark: "dark:bg-orange-900/40 dark:text-orange-300", dot: "bg-orange-500" },
  "Interjection":{ light: "bg-orange-100 text-orange-800",dark: "dark:bg-orange-900/40 dark:text-orange-300", dot: "bg-orange-500" },
  // DEFAULT
  "DEFAULT":    { light: "bg-slate-100 text-slate-600",   dark: "dark:bg-slate-800 dark:text-slate-300",      dot: "bg-slate-400" },
};

function getTypeStyle(type: string) {
  // Nomen'in "der Nomen", "die Nomen" gibi varyantlarını da yakala
  if (type?.toLowerCase().includes("nomen")) return typeStyles["Nomen"];
  return typeStyles[type] || typeStyles["DEFAULT"];
}

const subjectLang: Record<string, string> = {
  german: 'de-DE',
  english: 'en-US',
  spanish: 'es-ES',
};

function speak(text: string, subject: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = subjectLang[subject] || 'en-US';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

export default function ClientVocabularyApp({ initialWords, lang, subject, dict }: Props) {
  const [view, setView] = useState<'setup' | 'practice' | 'result'>('setup');
  const [currentSet, setCurrentSet] = useState<Word[]>([]);
  const [errorWords, setErrorWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [answered, setAnswered] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
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
    setFeedback({ text: '', isCorrect: null });
    setView('practice');
  };

  const handleNextSet = () => {
    const nextStart = range.end + 1;
    const nextEnd = Math.min(nextStart + lastRangeSize - 1, initialWords.length);
    if (nextStart <= initialWords.length) launchGame(nextStart, nextEnd);
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
    const isNoun = w.type === "İsim" || w.type === "Noun" || w.type === "Nomen" ||
      w.type === "Sustantivo" || w.type?.includes("Nomen");
    const isGerman = subject === "german";

    if (isGerman && isNoun) {
      const userParts = userValue.trim().split(/\s+/);
      const termParts = w.term.trim().split(/\s+/);
      if (userParts.length >= 2 && termParts.length >= 2) {
        isCorrect = userParts[0].toLowerCase() === termParts[0].toLowerCase() &&
          userParts[1] === termParts[1];
      } else {
        isCorrect = false;
      }
    } else if (isGerman) {
      isCorrect = userValue.toLowerCase() === w.term.toLowerCase();
    } else {
      isCorrect = userValue.toLowerCase() === w.term.toLowerCase();
    }

    if (isCorrect) {
      setAnswered(true);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      const correctMsg = lang === "tr" ? "Doğru! 🎉" : lang === "es" ? "¡Correcto! 🎉" : lang === "de" ? "Richtig! 🎉" : "Correct! 🎉";
      setFeedback({ text: correctMsg, isCorrect: true });
      setTimeout(() => {
        document.getElementById('next-btn-trigger')?.click();
      }, 800);
      return;
    }

    setAnswered(true);
    setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    setErrorWords(prev => [...prev, w]);
    const wrongMsg = lang === "tr" ? "Yanlış" : lang === "es" ? "Incorrecto" : lang === "de" ? "Falsch" : "Wrong";
    setFeedback({ text: `${wrongMsg}: ${w.term}`, isCorrect: false });
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
      setFeedback({ text: '', isCorrect: null });
    } else {
      setView('result');
    }
  };

  const currentWord = currentSet[idx];
  const progress = currentSet.length > 0 ? ((idx) / currentSet.length) * 100 : 0;
  const typeStyle = currentWord ? getTypeStyle(currentWord.type) : typeStyles["DEFAULT"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 pb-16 px-4">
      <div className="w-full max-w-sm">

        {/* ── SETUP EKRANI ── */}
        {view === 'setup' && (
          <div className="bg-white dark:bg-[#0d1424] rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden mt-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center">
              <p className="text-blue-200 text-[10px] font-bold tracking-widest uppercase mb-1">{subject}</p>
              <h1 className="text-white text-xl font-black tracking-tight">Vocabulary</h1>
              <p className="text-blue-100/80 text-xs mt-1">{t.setupLabel}</p>
            </div>

            <div className="p-5">
              {/* Hızlı seçim */}
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t.fastSelect}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => launchGame(1, Math.min(n, initialWords.length))}
                    className="py-3 rounded-2xl font-black text-sm border-2 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-200 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all active:scale-95 bg-white dark:bg-white/5"
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Aralık seçimi */}
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t.rangeSelect}</p>
              <div className="flex gap-2 items-center mb-5">
                <input
                  type="number"
                  value={range.start}
                  onChange={e => setRange({ ...range, start: Number(e.target.value) })}
                  className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center font-bold text-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-blue-500 text-sm"
                />
                <span className="text-slate-300 dark:text-slate-600 font-bold text-lg">—</span>
                <input
                  type="number"
                  value={range.end}
                  onChange={e => setRange({ ...range, end: Number(e.target.value) })}
                  className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center font-bold text-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-blue-500 text-sm"
                />
              </div>

              <button
                onClick={() => launchGame(range.start, range.end)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 uppercase tracking-widest transition-all"
              >
                {t.start} ({initialWords.length})
              </button>
            </div>
          </div>
        )}

        {/* ── PRACTICE EKRANI ── */}
        {view === 'practice' && currentWord && (
          <div className="mt-4">
            {/* Progress bar + header */}
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {idx + 1} <span className="text-slate-300 dark:text-slate-600">/</span> {currentSet.length}
              </span>
              <div className="flex-1 mx-3 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                onClick={() => setView('setup')}
                className="text-[11px] font-bold text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                {t.close}
              </button>
            </div>

            {/* Kart */}
            <div className="bg-white dark:bg-[#0d1424] rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 p-5 md:p-6">
              
              {/* Tür badge — tema uyumlu */}
              <div className="flex justify-center mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${typeStyle.light} ${typeStyle.dark}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                  {currentWord.type}
                </span>
              </div>

              {/* Anlam */}
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white text-center mb-3 tracking-tight leading-tight uppercase italic">
                {currentWord.meaning}
              </h2>

              {/* Örnek */}
              <p className="text-slate-400 dark:text-slate-500 italic text-center text-sm leading-relaxed mb-5">
                {currentWord.example.replace('***', '______')}
              </p>

              {/* Özel karakterler */}
              {specialChars.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {specialChars.map(char => (
                    <button
                      key={char}
                      onClick={() => handleCharClick(char)}
                      className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-white/10 hover:bg-blue-600 hover:text-white dark:text-white rounded-xl font-bold text-base transition-all active:scale-90"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <input
                id="word-input"
                autoFocus
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center text-lg font-bold text-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 mb-4 transition-colors"
                placeholder="..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              {/* Feedback */}
              <div className="flex items-center justify-center gap-2 min-h-[1.25rem] mb-4">
                <span
                  className={`font-bold text-sm italic transition-all ${
                    feedback.isCorrect === true
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : feedback.isCorrect === false
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-transparent'
                  }`}
                >
                  {feedback.text || '·'}
                </span>
                {answered && (
                  <button
                    onClick={() => speak(currentWord.term, subject)}
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-90 transition-all flex items-center justify-center flex-shrink-0"
                    title="Dinle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                      <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Butonlar */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleCheck}
                  className="py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                >
                  {t.check}
                </button>
                <button
                  id="next-btn-trigger"
                  onClick={handleNext}
                  className="py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.97] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all"
                >
                  {idx === currentSet.length - 1 ? t.finished : t.next}
                </button>
              </div>
            </div>

            {/* Stat bar altında */}
            <div className="flex justify-center gap-6 mt-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats.correct}
              </span>
              <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {stats.wrong}
              </span>
            </div>
          </div>
        )}

        {/* ── RESULT EKRANI ── */}
        {view === 'result' && (
          <div className="mt-6 bg-white dark:bg-[#0d1424] rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-7 text-center">
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-white text-xl font-black uppercase tracking-tight">{t.finished}</h2>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-emerald-100/70 text-[10px] uppercase tracking-widest mb-0.5">Doğru</p>
                  <p className="text-white text-2xl font-black">{stats.correct}</p>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-emerald-100/70 text-[10px] uppercase tracking-widest mb-0.5">Yanlış</p>
                  <p className="text-white text-2xl font-black">{stats.wrong}</p>
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-2.5">
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
                    setFeedback({ text: '', isCorrect: null });
                    setView('practice');
                  }}
                  className="py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all"
                >
                  {t.wrongRetry} ({errorWords.length})
                </button>
              )}

              {range.end < initialWords.length && (
                <button
                  onClick={handleNextSet}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {t.nextSet}
                </button>
              )}

              <button
                onClick={() => launchGame(range.start, range.end)}
                className="py-3.5 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all"
              >
                {t.retry}
              </button>

              <button
                onClick={() => setView('setup')}
                className="py-3.5 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-500/20 transition-all"
              >
                {t.main}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}