"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Home } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../../assets/img/logo.webp";

export default function Navbar() {
  // resolvedTheme: Sistem ayarı 'system' olsa bile o anki gerçek görünümü (dark/light) verir.
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Mevcut dili URL'den güvenli bir şekilde alıyoruz
  const segments = pathname.split("/");
  const currentLang = segments[1] || "tr";

  const changeLanguage = (lang: string) => {
    window.location.href = `/${lang}`;
  };

  // Temayı değiştiren güvenli fonksiyon
  const toggleTheme = () => {
    const targetTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(targetTheme);
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
      {/* SOL: Dinamik Ana Sayfa ve Logo */}
      <div className="flex gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <Link 
            href={`/${currentLang}`} 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {/* Logo eklemesi */}
            <Image 
              src={logo} 
              alt="Memorlex Logo" 
              width={32} 
              height={32} 
              className="object-contain"
              priority
            />
            {/* Marka İsmi (İsteğe bağlı, logoda zaten yazıyorsa Home ikonu yerine bunu kullanabilirsiniz) */}
            <span className="font-bold text-slate-800 dark:text-white hidden sm:block">
              Memorlex
            </span>
          </Link>
        </div>
      </div>

      {/* SAĞ: Dil ve Tema */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          
          <button onClick={() => changeLanguage("de")} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span className="text-lg">🇩🇪</span>
            <span className="text-[9px] font-black text-slate-500">DE</span>
          </button>
          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <button onClick={() => changeLanguage("en")} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span className="text-lg">🇬🇧</span>
            <span className="text-[9px] font-black text-slate-500">EN</span>
          </button>
          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <button onClick={() => changeLanguage("uk")} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span className="text-lg">🇺🇦</span>
            <span className="text-[9px] font-black text-slate-500">UK</span>
          </button>
          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <button onClick={() => changeLanguage("tr")} className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <span className="text-lg">🇹🇷</span>
            <span className="text-[9px] font-black text-slate-500">TR</span>
          </button>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-slate-600 dark:text-amber-400 transition-all active:scale-90"
        >
          {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}