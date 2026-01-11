import path from 'path';
import fs from 'fs';
import ClientVocabularyApp from '@/app/components/ClientVocabularyApp'; // Ortak bileşen yolu

export default async function VocabularyPage({ 
  params 
}: { 
  params: Promise<{ subject: string }> 
}) {
  const resolvedParams = await params;
  const currentSubject = resolvedParams.subject; 
  const currentLang = 'de'; // Almanca klasörüne bakması için [cite: 2026-01-11]

  const wordlistPath = path.join(
    process.cwd(), 
    'public', 
    'wordlist', 
    currentSubject, 
    currentLang, 
    'A1'
  );

  let files: string[] = [];
  if (fs.existsSync(wordlistPath)) {
    // Klasördeki .txt dosyalarını listeler [cite: 2026-01-08]
    files = fs.readdirSync(wordlistPath).filter(file => file.endsWith('.txt'));
  }

  return (
    <main>
      <ClientVocabularyApp 
        initialFiles={files} 
        lang={currentLang}
        subject={currentSubject}
        dict={{}} 
      />
    </main>
  );
}