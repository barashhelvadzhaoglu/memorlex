import path from 'path';
import fs from 'fs';
import ClientVocabularyApp from '@/app/components/ClientVocabularyApp'; // Yol güncellendi

export default async function VocabularyPage({ 
  params 
}: { 
  params: Promise<{ subject: string }> 
}) {
  const resolvedParams = await params;
  const currentSubject = resolvedParams.subject; 
  const currentLang = 'uk'; // Ukraynaca için 'uk' olarak güncellendi

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