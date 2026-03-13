import { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/dictionaries";

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

export async function generateStaticParams() {
  return [
    { lang: "en" }, { lang: "tr" }, { lang: "de" }, { lang: "uk" }, { lang: "es" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = "https://memorlex.com";

  const titles: Record<string, string> = {
    tr: "Hakkında | Memorlex Nedir? | Dil Öğrenme Platformu",
    en: "About | What is Memorlex? | Language Learning Platform",
    de: "Über uns | Was ist Memorlex? | Sprachlernplattform",
    uk: "Про нас | Що таке Memorlex? | Платформа вивчення мов",
    es: "Acerca de | ¿Qué es Memorlex? | Plataforma de Idiomas",
  };

  const descs: Record<string, string> = {
    tr: "Memorlex, Almanca, İngilizce ve İspanyolca öğrenmek için bilimsel, interaktif ve sınav odaklı bir dil öğrenme platformudur.",
    en: "Memorlex is a science-based, interactive language learning platform for German, English and Spanish — from A1 to C1.",
    de: "Memorlex ist eine wissenschaftliche, interaktive Sprachlernplattform für Deutsch, Englisch und Spanisch — von A1 bis C1.",
    uk: "Memorlex — науково обґрунтована інтерактивна платформа для вивчення німецької, англійської та іспанської мов.",
    es: "Memorlex es una plataforma de aprendizaje de idiomas científica e interactiva para alemán, inglés y español — de A1 a C1.",
  };

  return {
    title: titles[lang] || titles.en,
    description: descs[lang] || descs.en,
    alternates: {
      canonical: `${baseUrl}/${lang}/about`,
      languages: {
        tr: `${baseUrl}/tr/about`,
        en: `${baseUrl}/en/about`,
        de: `${baseUrl}/de/about`,
        uk: `${baseUrl}/uk/about`,
        es: `${baseUrl}/es/about`,
        "x-default": `${baseUrl}/en/about`,
      },
    },
  };
}

// ── Sayfa içeriği (dile göre) ────────────────────────────────────────────────
const CONTENT: Record<string, {
  badge: string; title: string; tagline: string;
  whatTitle: string; whatText: string;
  methodTitle: string; methodText: string;
  whyTitle: string;
  features: { icon: string; title: string; desc: string }[];
  statsLabel: string;
  stats: { value: string; label: string }[];
  ctaTitle: string; ctaBtn: string;
  contactLink: string;
}> = {
  tr: {
    badge: "Memorlex Nedir?",
    title: "Dil Öğrenme,\nBilimsel Yöntemle.",
    tagline: "Almanca, İngilizce ve İspanyolca için A1'den C1'e — hikayeler, flashcard ve yazma pratikleriyle.",
    whatTitle: "Platform Hakkında",
    whatText: "Memorlex, dil öğrenmeyi günlük bir alışkanlığa dönüştürmek için tasarlandı. Entegrasyon kursları, Telc ve Goethe sınavlarına hazırlanmak isteyenler için özel içerikler; YouTube dinleme pratikleri ve yapay zeka destekli geri bildirimlerle kapsamlı bir deneyim sunuyoruz.",
    methodTitle: "Yazarak Öğrenme Yöntemi",
    methodText: "Memorlex'i öne çıkaran şey, dilbilimciler tarafından kanıtlanmış yazarak öğrenme yöntemidir. Yazmak beyindeki sinir yollarını güçlendirir ve kalıcı öğrenmeyi hızlandırır. Flashcard, hikaye ve yazma pratikleriyle kelimelerinizi uzun süreli belleğe aktarırsınız.",
    whyTitle: "Neden Memorlex?",
    features: [
      { icon: "📖", title: "Seviyeli Hikayeler", desc: "A1'den C1'e, öğrenilen dile uygun kısa hikayeler" },
      { icon: "🧠", title: "Flashcard Sistemi", desc: "Aralıklı tekrar ile kalıcı kelime öğrenimi" },
      { icon: "✍️", title: "Yazma Pratikleri", desc: "Kelimeleri yazarak pekiştir, hataları anında gör" },
      { icon: "👂", title: "YouTube Lab", desc: "Native speaker videolar ile dinleme becerisini geliştir" },
      { icon: "🎓", title: "Sınav Hazırlığı", desc: "Telc, Goethe, IELTS ve DELE odaklı içerikler" },
      { icon: "🤖", title: "AI Feedback", desc: "Yapay zeka destekli anlık hata analizi" },
    ],
    statsLabel: "Rakamlarla Memorlex",
    stats: [
      { value: "3", label: "Dil" },
      { value: "A1–C1", label: "Tüm Seviyeler" },
      { value: "5+", label: "Çalışma Modu" },
      { value: "100%", label: "Ücretsiz" },
    ],
    ctaTitle: "Öğrenmeye Başla",
    ctaBtn: "Dil Seç →",
    contactLink: "İletişim için tıklayın",
  },
  en: {
    badge: "What is Memorlex?",
    title: "Language Learning,\nThe Scientific Way.",
    tagline: "German, English and Spanish from A1 to C1 — through stories, flashcards and writing practice.",
    whatTitle: "About the Platform",
    whatText: "Memorlex was built to turn language learning into a daily habit. We offer tailored content for integration courses, Telc and Goethe exam prep, YouTube listening practice, and AI-powered writing feedback — all in one place.",
    methodTitle: "The Writing-to-Learn Method",
    methodText: "What sets Memorlex apart is its writing-based learning approach, proven effective by linguists worldwide. Writing strengthens neural pathways and accelerates long-term retention. Through flashcards, graded stories and writing exercises, vocabulary moves into long-term memory faster.",
    whyTitle: "Why Memorlex?",
    features: [
      { icon: "📖", title: "Leveled Stories", desc: "Short stories from A1 to C1 in the target language" },
      { icon: "🧠", title: "Flashcard System", desc: "Spaced repetition for permanent vocabulary retention" },
      { icon: "✍️", title: "Writing Practice", desc: "Reinforce words by writing — see mistakes instantly" },
      { icon: "👂", title: "YouTube Lab", desc: "Develop listening skills with native speaker videos" },
      { icon: "🎓", title: "Exam Prep", desc: "Content focused on Telc, Goethe, IELTS and DELE" },
      { icon: "🤖", title: "AI Feedback", desc: "Instant error analysis powered by AI" },
    ],
    statsLabel: "Memorlex by the Numbers",
    stats: [
      { value: "3", label: "Languages" },
      { value: "A1–C1", label: "All Levels" },
      { value: "5+", label: "Study Modes" },
      { value: "100%", label: "Free" },
    ],
    ctaTitle: "Start Learning",
    ctaBtn: "Choose a Language →",
    contactLink: "Get in touch",
  },
  de: {
    badge: "Was ist Memorlex?",
    title: "Sprachenlernen,\nwissenschaftlich.",
    tagline: "Deutsch, Englisch und Spanisch von A1 bis C1 — mit Geschichten, Karteikarten und Schreibübungen.",
    whatTitle: "Über die Plattform",
    whatText: "Memorlex wurde entwickelt, um das Sprachenlernen zur täglichen Gewohnheit zu machen. Wir bieten maßgeschneiderte Inhalte für Integrationskurse, Telc- und Goethe-Prüfungsvorbereitung, YouTube-Hörübungen und KI-gestütztes Schreibfeedback — alles an einem Ort.",
    methodTitle: "Die Schreib-Lern-Methode",
    methodText: "Was Memorlex auszeichnet, ist die schreibbasierte Lernmethode, die von Linguisten weltweit als wirksam bestätigt wurde. Schreiben stärkt neuronale Pfade und beschleunigt das Langzeitgedächtnis. Durch Karteikarten, gestufte Geschichten und Schreibübungen wird Vokabular schneller ins Langzeitgedächtnis übertragen.",
    whyTitle: "Warum Memorlex?",
    features: [
      { icon: "📖", title: "Gestufte Geschichten", desc: "Kurzgeschichten von A1 bis C1 in der Zielsprache" },
      { icon: "🧠", title: "Karteikartenssystem", desc: "Spaced Repetition für dauerhaftes Vokabellernen" },
      { icon: "✍️", title: "Schreibübungen", desc: "Wörter durch Schreiben festigen — Fehler sofort sehen" },
      { icon: "👂", title: "YouTube Lab", desc: "Hörverstehen mit Muttersprachler-Videos entwickeln" },
      { icon: "🎓", title: "Prüfungsvorbereitung", desc: "Inhalte für Telc, Goethe, IELTS und DELE" },
      { icon: "🤖", title: "KI-Feedback", desc: "Sofortige Fehleranalyse mit KI-Unterstützung" },
    ],
    statsLabel: "Memorlex in Zahlen",
    stats: [
      { value: "3", label: "Sprachen" },
      { value: "A1–C1", label: "Alle Niveaus" },
      { value: "5+", label: "Lernmodi" },
      { value: "100%", label: "Kostenlos" },
    ],
    ctaTitle: "Jetzt lernen",
    ctaBtn: "Sprache wählen →",
    contactLink: "Kontakt aufnehmen",
  },
  uk: {
    badge: "Що таке Memorlex?",
    title: "Вивчення мов\nнауковим методом.",
    tagline: "Німецька, англійська та іспанська від A1 до C1 — через оповідання, картки та письмові вправи.",
    whatTitle: "Про платформу",
    whatText: "Memorlex створено для того, щоб зробити вивчення мов щоденною звичкою. Ми пропонуємо спеціальний контент для інтеграційних курсів, підготовки до Telc і Goethe, практики аудіювання на YouTube та зворотного зв'язку на основі ШІ.",
    methodTitle: "Метод навчання через письмо",
    methodText: "Що відрізняє Memorlex — це метод навчання через письмо, підтверджений лінгвістами по всьому світу. Письмо зміцнює нейронні зв'язки та прискорює довгострокове запам'ятовування.",
    whyTitle: "Чому Memorlex?",
    features: [
      { icon: "📖", title: "Оповідання за рівнем", desc: "Короткі оповідання від A1 до C1" },
      { icon: "🧠", title: "Система карток", desc: "Інтервальне повторення для постійного засвоєння" },
      { icon: "✍️", title: "Письмові вправи", desc: "Закріплення слів через письмо — помилки видно одразу" },
      { icon: "👂", title: "YouTube Lab", desc: "Розвиток аудіювання з носіями мови" },
      { icon: "🎓", title: "Підготовка до іспитів", desc: "Контент для Telc, Goethe, IELTS та DELE" },
      { icon: "🤖", title: "ШІ-зворотний зв'язок", desc: "Миттєвий аналіз помилок за допомогою ШІ" },
    ],
    statsLabel: "Memorlex у цифрах",
    stats: [
      { value: "3", label: "Мови" },
      { value: "A1–C1", label: "Всі рівні" },
      { value: "5+", label: "Режими навчання" },
      { value: "100%", label: "Безкоштовно" },
    ],
    ctaTitle: "Почніть навчання",
    ctaBtn: "Обрати мову →",
    contactLink: "Зв'яжіться з нами",
  },
  es: {
    badge: "¿Qué es Memorlex?",
    title: "Aprendizaje de Idiomas,\nde Forma Científica.",
    tagline: "Alemán, inglés y español de A1 a C1 — con historias, tarjetas y práctica de escritura.",
    whatTitle: "Sobre la Plataforma",
    whatText: "Memorlex fue creado para convertir el aprendizaje de idiomas en un hábito diario. Ofrecemos contenido personalizado para cursos de integración, preparación para DELE, IELTS, Telc y Goethe, práctica de escucha en YouTube y retroalimentación con IA.",
    methodTitle: "El Método de Aprender Escribiendo",
    methodText: "Lo que distingue a Memorlex es su enfoque de aprendizaje basado en la escritura, demostrado eficaz por lingüistas de todo el mundo. Escribir fortalece las vías neuronales y acelera la retención a largo plazo.",
    whyTitle: "¿Por qué Memorlex?",
    features: [
      { icon: "📖", title: "Historias por Nivel", desc: "Historias cortas de A1 a C1 en el idioma objetivo" },
      { icon: "🧠", title: "Sistema de Tarjetas", desc: "Repetición espaciada para retención permanente" },
      { icon: "✍️", title: "Práctica de Escritura", desc: "Refuerza palabras escribiendo — ve los errores al instante" },
      { icon: "👂", title: "YouTube Lab", desc: "Desarrolla la comprensión auditiva con hablantes nativos" },
      { icon: "🎓", title: "Preparación para Exámenes", desc: "Contenido para DELE, SIELE, IELTS, Telc y Goethe" },
      { icon: "🤖", title: "Retroalimentación IA", desc: "Análisis instantáneo de errores con IA" },
    ],
    statsLabel: "Memorlex en Números",
    stats: [
      { value: "3", label: "Idiomas" },
      { value: "A1–C1", label: "Todos los Niveles" },
      { value: "5+", label: "Modos de Estudio" },
      { value: "100%", label: "Gratuito" },
    ],
    ctaTitle: "Empieza a Aprender",
    ctaBtn: "Elige un Idioma →",
    contactLink: "Ponte en contacto",
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const c = CONTENT[lang] || CONTENT.en;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* ── Hero ── */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
            {c.badge}
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-6 leading-none whitespace-pre-line">
            {c.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            {c.tagline}
          </p>
        </div>

        {/* ── İki sütun metin ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black uppercase tracking-tight text-amber-500 mb-4">{c.whatTitle}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{c.whatText}</p>
          </div>
          <div className="bg-slate-900 dark:bg-white rounded-[40px] p-8">
            <h2 className="text-xl font-black uppercase tracking-tight text-amber-500 mb-4">{c.methodTitle}</h2>
            <p className="text-slate-300 dark:text-slate-700 leading-relaxed">{c.methodText}</p>
          </div>
        </div>

        {/* ── Rakamlar ── */}
        <div className="mb-20">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-8">{c.statsLabel}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {c.stats.map((s) => (
              <div key={s.label} className="text-center p-6 bg-amber-500 rounded-[32px] text-white">
                <div className="text-3xl font-black mb-1">{s.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Özellikler ── */}
        <div className="mb-20">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white text-center mb-10">
            {c.whyTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.features.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 hover:border-amber-500 transition-all group"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{f.icon}</span>
                <h3 className="font-black uppercase text-sm mb-1 text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center bg-slate-900 dark:bg-white rounded-[50px] p-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white dark:text-slate-900 mb-8">
            {c.ctaTitle}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}`}
              className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-xl shadow-amber-500/20"
            >
              {c.ctaBtn}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="px-10 py-4 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 text-white dark:text-slate-900 rounded-full font-black uppercase tracking-widest text-sm transition-all border border-white/20"
            >
              {c.contactLink}
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}