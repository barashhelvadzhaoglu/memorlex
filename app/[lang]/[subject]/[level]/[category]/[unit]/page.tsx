import { getVocab } from '@/src/lib/vocabLoader'; 
import ClientFlashcardApp from '@/app/components/ClientFlashcardApp';
import ClientVocabularyApp from '@/app/components/ClientVocabularyApp';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries'; 

// Beklenen dil tiplerini tanımlayalım
type ValidLangs = "en" | "tr" | "de" | "uk";

interface PageProps {
  params: Promise<{
    lang: string;
    subject: string;
    level: string;
    category: string;
    unit: string;
  }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function UnitPage({ params, searchParams }: PageProps) {
  // 1. Parametreleri ve Arayüz Sözlüğünü Bekle
  const { lang, subject, level, category, unit } = await params;
  const { mode } = await searchParams;
  
  // HATA ÇÖZÜMÜ: lang değişkenini ValidLangs tipine zorluyoruz
  // Eğer lang bunlardan biri değilse getDictionary hata vermesin diye.
  const dict = await getDictionary(lang as ValidLangs);

  // 2. JSON Verisini getVocab ile Getir
  const data = await getVocab(lang, subject, level, category, unit);
  
  // Veri bulunamazsa 404 göster
  if (!data) {
    console.error(`VERI BULUNAMADI: ${subject}/${level}/${category}/${unit}`);
    return notFound();
  }

  // 3. Mod seçimi için URL yapısı
  const baseUrl = `/${lang}/${subject}/${level}/${category}/${unit}`;

  // --- SEÇİM EKRANI (Henüz mod seçilmediyse) ---
  if (!mode) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-white text-center">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-amber-500">
          {data.title || unit.replace(/-/g, ' ')}
        </h1>
        
        <p className="text-slate-400 mb-10 font-bold italic">{dict.description}</p>
        
        <div className="grid gap-6 w-full max-w-sm">
          {/* Flashcard Butonu */}
          <a 
            href={`${baseUrl}?mode=flashcard`}
            className="p-8 bg-slate-900 border-2 border-amber-500/30 hover:border-amber-500 rounded-[32px] shadow-2xl transition-all group"
          >
            <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">🎴</span>
            <span className="text-2xl font-black">{dict.flashcards}</span>
          </a>

          {/* Yazma Pratiği Butonu */}
          <a 
            href={`${baseUrl}?mode=write`}
            className="p-8 bg-slate-900 border-2 border-blue-500/30 hover:border-blue-600 rounded-[32px] shadow-2xl transition-all group"
          >
            <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform text-blue-500">✍️</span>
            <span className="text-2xl font-black">{dict.practice}</span>
          </a>
        </div>
      </main>
    );
  }

  // --- UYGULAMA EKRANI (Mod seçildiyse) ---
  return (
    <main className="min-h-screen bg-slate-950 py-8 px-4">
      {mode === 'write' ? (
        <ClientVocabularyApp 
          initialWords={data.words} 
          lang={lang} 
          subject={data.title || unit} 
        />
      ) : (
        <ClientFlashcardApp 
          initialWords={data.words} 
          lang={lang} 
          subject={data.title || unit} 
        />
      )}
    </main>
  );
}