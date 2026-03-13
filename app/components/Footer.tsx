"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

const FOOTER_LABELS: Record<ValidLangs, {
  tagline: string;
  languages: string;
  levels: string;
  about: string;
  contact: string;
  privacy: string;
  rights: string;
  german: string;
  english: string;
  spanish: string;
}> = {
  tr: {
    tagline: "Almanca, İngilizce ve İspanyolca öğrenin — A1'den C1'e, hikayeler ve flashcard ile.",
    languages: "Diller", levels: "Seviyeler",
    about: "Hakkında", contact: "İletişim", privacy: "Gizlilik",
    rights: "Tüm hakları saklıdır.",
    german: "Almanca", english: "İngilizce", spanish: "İspanyolca",
  },
  en: {
    tagline: "Learn German, English and Spanish — from A1 to C1, with stories and flashcards.",
    languages: "Languages", levels: "Levels",
    about: "About", contact: "Contact", privacy: "Privacy",
    rights: "All rights reserved.",
    german: "German", english: "English", spanish: "Spanish",
  },
  de: {
    tagline: "Deutsch, Englisch und Spanisch lernen — von A1 bis C1, mit Geschichten und Karteikarten.",
    languages: "Sprachen", levels: "Niveaus",
    about: "Über uns", contact: "Kontakt", privacy: "Datenschutz",
    rights: "Alle Rechte vorbehalten.",
    german: "Deutsch", english: "Englisch", spanish: "Spanisch",
  },
  uk: {
    tagline: "Вивчайте німецьку, англійську та іспанську — від A1 до C1, з оповіданнями та картками.",
    languages: "Мови", levels: "Рівні",
    about: "Про нас", contact: "Контакт", privacy: "Конфіденційність",
    rights: "Всі права захищені.",
    german: "Німецька", english: "Англійська", spanish: "Іспанська",
  },
  es: {
    tagline: "Aprende alemán, inglés y español — de A1 a C1, con historias y tarjetas.",
    languages: "Idiomas", levels: "Niveles",
    about: "Acerca de", contact: "Contacto", privacy: "Privacidad",
    rights: "Todos los derechos reservados.",
    german: "Alemán", english: "Inglés", spanish: "Español",
  },
};

const LEVELS = ["a1", "a2", "b1", "b2", "c1"];

export default function Footer() {
  const pathname = usePathname();
  const lang = (pathname.split("/")[1] || "en") as ValidLangs;
  const t = FOOTER_LABELS[lang] || FOOTER_LABELS.en;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* ── Üst: Logo + Linkler ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Marka */}
          <div className="col-span-2 md:col-span-1">
            <Link href={`/${lang}`} className="inline-block mb-4">
              <span className="text-3xl font-black italic text-amber-500 tracking-tighter">
                Memorlex
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              {t.tagline}
            </p>
          </div>

          {/* Diller */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
              {t.languages}
            </p>
            <div className="flex flex-col gap-2">
              {[
                { id: "german",  flag: "🇩🇪", label: t.german  },
                { id: "english", flag: "🇬🇧", label: t.english },
                { id: "spanish", flag: "🇪🇸", label: t.spanish },
              ].map((s) => (
                <Link
                  key={s.id}
                  href={`/${lang}/${s.id}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-amber-500 transition-colors text-sm font-bold"
                >
                  <span>{s.flag}</span>
                  <span>{s.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Seviyeler — URL'deki subject'e göre dinamik */}
          {(() => {
            const segments = pathname.split("/").filter(Boolean);
            const urlSubject = segments[1];
            const validSubjects = ["german", "english", "spanish"];
            const activeSubject = validSubjects.includes(urlSubject) ? urlSubject : "german";
            const subjectLabel = {
              german: t.german, english: t.english, spanish: t.spanish,
            }[activeSubject] || t.german;

            return (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                  {subjectLabel} — {t.levels}
                </p>
                <div className="flex flex-col gap-2">
                  {LEVELS.map((lvl) => (
                    <Link
                      key={lvl}
                      href={`/${lang}/${activeSubject}/${lvl}`}
                      className="text-slate-300 hover:text-amber-500 transition-colors text-sm font-bold uppercase"
                    >
                      {subjectLabel} {lvl.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Şirket linkleri */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
              Memorlex
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${lang}/about`}
                className="text-slate-300 hover:text-amber-500 transition-colors text-sm font-bold"
              >
                {t.about}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="text-slate-300 hover:text-amber-500 transition-colors text-sm font-bold"
              >
                {t.contact}
              </Link>
              <a
                href="https://youtube.com/@memorlex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-red-500 transition-colors text-sm font-bold flex items-center gap-1.5"
              >
                <span>▶</span> YouTube
              </a>
              <a
                href="mailto:info@memorlex.com"
                className="text-slate-300 hover:text-amber-500 transition-colors text-sm font-bold"
              >
                info@memorlex.com
              </a>
            </div>
          </div>
        </div>

        {/* ── Alt: copyright ── */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs font-bold">
            © {year} Memorlex. {t.rights}
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <Link href={`/${lang}/about`} className="hover:text-amber-500 transition-colors">
              {t.about}
            </Link>
            <span>·</span>
            <Link href={`/${lang}/contact`} className="hover:text-amber-500 transition-colors">
              {t.contact}
            </Link>
            <span>·</span>
            <Link href={`/${lang}/privacy`} className="hover:text-amber-500 transition-colors">
              {t.privacy}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}