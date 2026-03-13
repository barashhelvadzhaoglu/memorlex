"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, X, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../../assets/img/logo.webp";

// ── Tipler ──────────────────────────────────────────────────────────────────
type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// ── Sabitler ────────────────────────────────────────────────────────────────
const LEVELS = ["a1", "a2", "b1", "b2", "c1"] as const;

const SUBJECTS = [
  { id: "german",  flag: "🇩🇪", color: "text-yellow-500" },
  { id: "english", flag: "🇬🇧", color: "text-blue-500"   },
  { id: "spanish", flag: "🇪🇸", color: "text-red-500"    },
] as const;

const UI_LANGS = [
  { code: "de", flag: "🇩🇪", label: "DE" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "uk", flag: "🇺🇦", label: "UK" },
  { code: "tr", flag: "🇹🇷", label: "TR" },
] as const;

// ── Çeviri metinleri ────────────────────────────────────────────────────────
const NAV_LABELS: Record<ValidLangs, {
  subjects: Record<string, string>;
  sections: { vocab: string; stories: string; home: string; about: string; contact: string };
}> = {
  tr: {
    subjects: { german: "Almanca", english: "İngilizce", spanish: "İspanyolca" },
    sections: { vocab: "Kelime", stories: "Hikayeler", home: "Ana Sayfa", about: "Hakkında", contact: "İletişim" },
  },
  en: {
    subjects: { german: "German", english: "English", spanish: "Spanish" },
    sections: { vocab: "Vocabulary", stories: "Stories", home: "Home", about: "About", contact: "Contact" },
  },
  de: {
    subjects: { german: "Deutsch", english: "Englisch", spanish: "Spanisch" },
    sections: { vocab: "Vokabeln", stories: "Geschichten", home: "Startseite", about: "Über uns", contact: "Kontakt" },
  },
  uk: {
    subjects: { german: "Німецька", english: "Англійська", spanish: "Іспанська" },
    sections: { vocab: "Слова", stories: "Оповідання", home: "Головна", about: "Про нас", contact: "Контакт" },
  },
  es: {
    subjects: { german: "Alemán", english: "Inglés", spanish: "Español" },
    sections: { vocab: "Vocabulario", stories: "Historias", home: "Inicio", about: "Acerca de", contact: "Contacto" },
  },
};

// ── Yardımcı: URL'den mevcut dili al ────────────────────────────────────────
function useParsedPath() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return {
    lang:    (segments[0] || "en") as ValidLangs,
    subject: segments[1] || null,
    level:   segments[2] || null,
    page:    segments[1] || null, // "about" | "contact" | "privacy" vb.
  };
}

// ── Ana bileşen ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { lang, subject: activeSubject, level: activeLevel, page: activePage } = useParsedPath();

  // Hangi subject dropdown'ı açık?
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  // Mobil menü açık mı?
  const [mobileOpen, setMobileOpen] = useState(false);
  // Mobilde açık olan subject accordion
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Dışarıya tıklayınca dropdown kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenSubject(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Route değişince menüleri kapat
  const pathname = usePathname();
  useEffect(() => {
    setOpenSubject(null);
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  const t = NAV_LABELS[lang] || NAV_LABELS.en;

  const changeLang = (newLang: string) => {
    window.location.href = `/${newLang}`;
  };

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  // ── Mega dropdown içeriği (desktop) ──────────────────────────────────────
  function MegaDropdown({ subjectId }: { subjectId: string }) {
    const subjectObj = SUBJECTS.find((s) => s.id === subjectId)!;
    return (
      <div className="absolute top-full left-0 mt-2 w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
        {/* Subject başlık */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-2xl">{subjectObj.flag}</span>
          <span className={`font-black uppercase text-sm tracking-widest ${subjectObj.color}`}>
            {t.subjects[subjectId]}
          </span>
          <Link
            href={`/${lang}/${subjectId}`}
            className="ml-auto text-[10px] font-bold text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-widest"
          >
            {t.sections.home} →
          </Link>
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map((lvl) => (
            <div key={lvl} className="flex flex-col gap-1.5">
              {/* Level badge */}
              <div
                className={`text-center py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                  ${activeLevel === lvl && activeSubject === subjectId
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700"
                  }`}
              >
                {lvl.toUpperCase()}
              </div>

              {/* Vocabulary linki */}
              <Link
                href={`/${lang}/${subjectId}/${lvl}`}
                className="text-center py-1.5 px-1 rounded-lg text-[10px] font-bold
                           bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300
                           hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400
                           border border-transparent hover:border-blue-200 dark:hover:border-blue-700
                           transition-all"
              >
                📚 {t.sections.vocab}
              </Link>

              {/* Stories linki */}
              <Link
                href={`/${lang}/${subjectId}/${lvl}/stories`}
                className="text-center py-1.5 px-1 rounded-lg text-[10px] font-bold
                           bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300
                           hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400
                           border border-transparent hover:border-amber-200 dark:hover:border-amber-700
                           transition-all"
              >
                📖 {t.sections.stories}
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Mobil accordion içeriği ───────────────────────────────────────────────
  function MobileAccordion({ subjectId }: { subjectId: string }) {
    const subjectObj = SUBJECTS.find((s) => s.id === subjectId)!;
    const isOpen = mobileAccordion === subjectId;

    return (
      <div className="border-b border-slate-100 dark:border-slate-800">
        {/* Başlık satırı */}
        <button
          onClick={() => setMobileAccordion(isOpen ? null : subjectId)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{subjectObj.flag}</span>
            <span className={`font-black uppercase text-sm tracking-widest ${subjectObj.color}`}>
              {t.subjects[subjectId]}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* İçerik */}
        {isOpen && (
          <div className="px-4 pb-4">
            {/* Subject ana sayfası */}
            <Link
              href={`/${lang}/${subjectId}`}
              className="block text-xs font-bold text-amber-500 mb-3 uppercase tracking-widest"
            >
              {t.sections.home} →
            </Link>

            {/* Her level için satır */}
            <div className="space-y-2">
              {LEVELS.map((lvl) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest w-8 text-center py-0.5 rounded
                      ${activeLevel === lvl && activeSubject === subjectId
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                  >
                    {lvl}
                  </span>
                  <Link
                    href={`/${lang}/${subjectId}/${lvl}`}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-center"
                  >
                    📚 {t.sections.vocab}
                  </Link>
                  <Link
                    href={`/${lang}/${subjectId}/${lvl}/stories`}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-center"
                  >
                    📖 {t.sections.stories}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── DESKTOP NAVBAR ─────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2
                   bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                   px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800
                   shadow-xl shadow-black/5"
      >
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 px-2 py-1 hover:opacity-80 transition-opacity mr-1">
          <Image src={logo} alt="Memorlex" width={28} height={28} className="object-contain" priority />
          <span className="font-black text-slate-800 dark:text-white text-sm hidden lg:block">Memorlex</span>
        </Link>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

        {/* Subject butonları + dropdown */}
        {SUBJECTS.map((s) => (
          <div key={s.id} className="relative">
            <button
              onClick={() => setOpenSubject(openSubject === s.id ? null : s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                ${openSubject === s.id
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }
                ${activeSubject === s.id ? "text-amber-500" : "text-slate-600 dark:text-slate-300"}
              `}
            >
              <span>{s.flag}</span>
              <span className="hidden lg:block">{t.subjects[s.id]}</span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${openSubject === s.id ? "rotate-180" : ""}`}
              />
            </button>

            {openSubject === s.id && <MegaDropdown subjectId={s.id} />}
          </div>
        ))}

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

        {/* About + Contact */}
        <Link
          href={`/${lang}/about`}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
            ${activePage === "about"
              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500 border border-amber-200 dark:border-amber-500/30"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-500"
            }`}
        >
          {t.sections.about}
        </Link>
        <Link
          href={`/${lang}/contact`}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
            ${activePage === "contact"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
              : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
        >
          {t.sections.contact}
        </Link>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

        {/* Dil seçici */}
        <div className="flex items-center gap-0.5">
          {UI_LANGS.map((l, i) => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all
                ${lang === l.code
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }
              `}
            >
              <span className="text-base">{l.flag}</span>
              <span className="text-[9px] font-black hidden xl:block">{l.label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

        {/* Tema */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-amber-400 transition-all"
        >
          {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* ── MOBİL NAVBAR ───────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        {/* Üst bar */}
        <div className="flex items-center justify-between px-4 py-3
                        bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
                        border-b border-slate-100 dark:border-slate-800">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <Image src={logo} alt="Memorlex" width={28} height={28} className="object-contain" priority />
            <span className="font-black text-slate-800 dark:text-white text-sm">Memorlex</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-amber-400"
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {mobileOpen ? <X size={18} /> : (
                <div className="flex flex-col gap-1 w-[18px]">
                  <span className="block h-0.5 bg-current rounded-full" />
                  <span className="block h-0.5 bg-current rounded-full" />
                  <span className="block h-0.5 bg-current rounded-full" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobil menü paneli */}
        {mobileOpen && (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xl max-h-[80vh] overflow-y-auto">

            {/* Subject accordion'ları */}
            {SUBJECTS.map((s) => (
              <MobileAccordion key={s.id} subjectId={s.id} />
            ))}

            {/* Dil seçici */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Language / Sprache / Dil</p>
              <div className="flex gap-2 flex-wrap">
                {UI_LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLang(l.code)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                      ${lang === l.code
                        ? "bg-amber-500 text-white"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }
                    `}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ana sayfa linki */}
            <Link
              href={`/${lang}`}
              className="block px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800"
            >
              🏠 {t.sections.home}
            </Link>

            {/* About + Contact */}
            <Link
              href={`/${lang}/about`}
              className={`block px-4 py-3 text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 transition-colors
                ${activePage === "about"
                  ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-amber-500"
                }`}
            >
              ℹ️ {t.sections.about}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className={`block px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors
                ${activePage === "contact"
                  ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
                  : "text-amber-500 hover:text-amber-600"
                }`}
            >
              ✉️ {t.sections.contact}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}