import path from 'path';
import fs from 'fs';
import ClientFlashcardApp from '@/app/components/ClientFlashcardApp'; // Yol güncellendi

export default async function FlashcardsPage({ 
  params 
}: { 
  params: Promise<{ subject: string }> 
}) {
  const resolvedParams = await params;
  const currentSubject = resolvedParams.subject; 
  const currentLang = 'uk'; // Ukraynaca için 'uk' olarak güncellendi

  const wordlistPath = path.join(process.cwd(), 'public', 'wordlist', currentSubject, currentLang, 'A1');

  let files: string[] = [];
  if (fs.existsSync(wordlistPath)) {
    files = fs.readdirSync(wordlistPath).filter(file => file.endsWith('.txt'));
  }

  return (
    <main>
      <ClientFlashcardApp 
        initialFiles={files} 
        lang={currentLang}
        subject={currentSubject}
      />
    </main>
  );
}