import path from 'path';
import fs from 'fs';
import ClientVocabularyApp from '@/app/components/ClientVocabularyApp';

export default async function VocabularyPage({ 
  params 
}: { 
  params: Promise<{ subject: string }> 
}) {
  const resolvedParams = await params;
  const currentSubject = resolvedParams.subject; 
  const currentLang = 'uk'; // Sistemin /uk klasörüne bakması için kritik

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
    // Dosyaları okur ve alfabetik sıralar
    files = fs.readdirSync(wordlistPath)
      .filter(file => file.endsWith('.txt'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  return (
    <main className="pt-20">
      <ClientVocabularyApp 
        initialFiles={files} 
        lang={currentLang}
        subject={currentSubject}
        dict={{}} 
      />
    </main>
  );
}