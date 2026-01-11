import Link from 'next/link';

export default function UkrainianLandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Ласкаво просимо! 👋</h1>
          <p className="text-slate-500">Яку мову ви хочете вивчати?</p>
        </div>

        <div className="space-y-4">
          {/* Almanca Kartı - Aktif */}
          <Link 
            href="/uk/german" 
            className="flex items-center p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-amber-500 hover:shadow-lg transition-all group"
          >
            <div className="text-4xl mr-4">🇩🇪</div>
            <div className="text-left flex-1 text-slate-800">
              <h2 className="text-xl font-bold">Deutsch</h2>
              <p className="text-sm font-medium opacity-60">РІВЕНЬ A1 - A2</p>
            </div>
          </Link>

          {/* İngilizce Kartı - Pasif (Greyout) */}
          <div className="flex items-center p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl opacity-40 cursor-not-allowed">
            <div className="text-4xl mr-4 grayscale">🇬🇧</div>
            <div className="text-left flex-1 text-slate-400">
              <h2 className="text-xl font-bold">English</h2>
              <p className="text-sm font-medium">НЕЗАБАРОМ</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}