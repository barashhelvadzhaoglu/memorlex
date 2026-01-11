import Link from 'next/link';

export default async function SubjectSelectionPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Title: Practice */}
      <h1 className="text-3xl md:text-4xl font-black mb-10 text-slate-800 dark:text-white capitalize tracking-tight">
        {subject} Practice
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Vocabulary List Card */}
        <Link 
          href={`/en/${subject}/vocabulary`} 
          className="group p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] hover:border-amber-500 dark:hover:border-amber-500 text-center transition-all shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</div>
          <h2 className="font-black text-xl text-slate-800 dark:text-slate-100 mb-1">Vocabulary List</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Start learning</p>
        </Link>

        {/* Flashcards Card */}
        <Link 
          href={`/en/${subject}/flashcards`} 
          className="group p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] hover:border-blue-500 dark:hover:border-blue-500 text-center transition-all shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🃏</div>
          <h2 className="font-black text-xl text-slate-800 dark:text-slate-100 mb-1">Flashcards</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Test yourself</p>
        </Link>
      </div>
    </main>
  );
}