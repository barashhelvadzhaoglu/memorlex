"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Home } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Mevcut dili URL'den güvenli bir şekilde alıyoruz
  const segments = pathname.split("/");
  const currentLang = segments[1] || "tr";

  // Dil değiştirme fonksiyonu: Sadece ana dil dizinine gider
  const changeLanguage = (lang: string) => {
    window.location.href = `/${lang}`;
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
      {/* SOL: Dinamik Ana Sayfa */}
      <div className="flex gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <Link 
            href={`/${currentLang}`} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Home size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
        </div>
      </div>

      {/* SAĞ: Dil ve Tema */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          
          {/* DE */}
          <button 
            onClick={() => changeLanguage("de")}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <span className="text-lg">🇩🇪</span>
            <span className="text-[9px] font-black text-slate-500">DE</span>
          </button>

          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />

          {/* EN */}
          <button 
            onClick={() => changeLanguage("en")}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <span className="text-lg">🇬🇧</span>
            <span className="text-[9px] font-black text-slate-500">EN</span>
          </button>

          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />

          {/* UK */}
          <button 
            onClick={() => changeLanguage("uk")}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <span className="text-lg">🇺🇦</span>
            <span className="text-[9px] font-black text-slate-500">UK</span>
          </button>

          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />

          {/* TR */}
          <button 
            onClick={() => changeLanguage("tr")}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <span className="text-lg">🇹🇷</span>
            <span className="text-[9px] font-black text-slate-500">TR</span>
          </button>
        </div>

        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-slate-600 dark:text-amber-400"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}