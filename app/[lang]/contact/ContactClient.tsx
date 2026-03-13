"use client";

import { useState } from "react";

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// ── Çeviri metinleri ────────────────────────────────────────────────────────
const LABELS: Record<ValidLangs, {
  title: string; sub: string;
  name: string; email: string; subject: string; message: string;
  send: string; sending: string; success: string; error: string;
  namePh: string; emailPh: string; subjectPh: string; messagePh: string;
  info: string; infoSub: string; responseTime: string;
}> = {
  tr: {
    title: "İletişim", sub: "Soru, öneri veya geri bildiriminizi bekliyoruz.",
    name: "Adınız", email: "E-posta", subject: "Konu", message: "Mesajınız",
    namePh: "Adınızı girin", emailPh: "ornek@email.com",
    subjectPh: "Mesajınızın konusu", messagePh: "Mesajınızı buraya yazın...",
    send: "GÖNDER", sending: "GÖNDERİLİYOR...",
    success: "Mesajınız iletildi! En kısa sürede geri döneceğiz.",
    error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    info: "Bize Ulaşın", infoSub: "Memorlex hakkında her türlü sorunuz için buradayız.",
    responseTime: "Yanıt süresi: 24-48 saat",
  },
  en: {
    title: "Contact", sub: "We'd love to hear from you — questions, feedback or suggestions.",
    name: "Your Name", email: "Email", subject: "Subject", message: "Message",
    namePh: "Enter your name", emailPh: "hello@example.com",
    subjectPh: "What's this about?", messagePh: "Write your message here...",
    send: "SEND", sending: "SENDING...",
    success: "Message sent! We'll get back to you within 24–48 hours.",
    error: "Something went wrong. Please try again.",
    info: "Get in Touch", infoSub: "We're here for any questions about Memorlex.",
    responseTime: "Response time: 24–48 hours",
  },
  de: {
    title: "Kontakt", sub: "Fragen, Vorschläge oder Feedback — wir freuen uns darauf.",
    name: "Ihr Name", email: "E-Mail", subject: "Betreff", message: "Nachricht",
    namePh: "Ihren Namen eingeben", emailPh: "beispiel@email.com",
    subjectPh: "Worum geht es?", messagePh: "Ihre Nachricht hier...",
    send: "SENDEN", sending: "WIRD GESENDET...",
    success: "Nachricht gesendet! Wir melden uns innerhalb von 24–48 Stunden.",
    error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    info: "Kontaktieren Sie uns", infoSub: "Wir sind für alle Fragen zu Memorlex da.",
    responseTime: "Antwortzeit: 24–48 Stunden",
  },
  uk: {
    title: "Контакт", sub: "Питання, пропозиції або відгуки — ми чекаємо на вас.",
    name: "Ваше ім'я", email: "Електронна пошта", subject: "Тема", message: "Повідомлення",
    namePh: "Введіть ваше ім'я", emailPh: "приклад@email.com",
    subjectPh: "Про що ваше повідомлення?", messagePh: "Напишіть своє повідомлення тут...",
    send: "НАДІСЛАТИ", sending: "НАДСИЛАЄТЬСЯ...",
    success: "Повідомлення надіслано! Ми відповімо протягом 24–48 годин.",
    error: "Сталася помилка. Будь ласка, спробуйте ще раз.",
    info: "Зв'яжіться з нами", infoSub: "Ми тут для будь-яких питань щодо Memorlex.",
    responseTime: "Час відповіді: 24–48 годин",
  },
  es: {
    title: "Contacto", sub: "Preguntas, sugerencias o comentarios — estamos aquí para ti.",
    name: "Tu Nombre", email: "Correo electrónico", subject: "Asunto", message: "Mensaje",
    namePh: "Ingresa tu nombre", emailPh: "ejemplo@correo.com",
    subjectPh: "¿De qué se trata?", messagePh: "Escribe tu mensaje aquí...",
    send: "ENVIAR", sending: "ENVIANDO...",
    success: "¡Mensaje enviado! Te responderemos en 24–48 horas.",
    error: "Algo salió mal. Por favor, inténtalo de nuevo.",
    info: "Ponte en Contacto", infoSub: "Estamos aquí para cualquier pregunta sobre Memorlex.",
    responseTime: "Tiempo de respuesta: 24–48 horas",
  },
};

// ── FORMSPREE FORM ID — buraya kendi ID'ni yapıştır ─────────────────────────
// https://formspree.io → New Form → Form ID (xyzabcde gibi)
const FORMSPREE_ID = "mlgplnrp";

export default function ContactClient({ lang }: { lang: ValidLangs }) {
  const t = LABELS[lang] || LABELS.en;

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* ── Başlık ── */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-amber-500 mb-4">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-xl mx-auto">
            {t.sub}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">

          {/* ── Sol: Bilgi kartı ── */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-amber-500 rounded-[40px] p-8 text-white">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-3">{t.info}</h2>
              <p className="text-white/80 text-sm leading-relaxed mb-6">{t.infoSub}</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 rounded-2xl px-4 py-2">
                <span>⏱</span>
                <span>{t.responseTime}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</p>
              <a
                href="mailto:info@memorlex.com"
                className="text-slate-800 dark:text-white font-bold hover:text-amber-500 transition-colors"
              >
                info@memorlex.com
              </a>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">YouTube</p>
              <a
                href="https://youtube.com/@memorlex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors font-bold text-sm"
              >
                <span className="text-xl">▶</span>
                @memorlex
              </a>
            </div>
          </div>

          {/* ── Sağ: Form ── */}
          <div className="md:col-span-3">
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-[40px] border-2 border-emerald-200 dark:border-emerald-800">
                <div className="text-6xl mb-6">🎉</div>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{t.success}</p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-8 px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
                >
                  ←
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
                <div className="space-y-4">

                  {[
                    { key: "name",    label: t.name,    ph: t.namePh,    type: "text"  },
                    { key: "email",   label: t.email,   ph: t.emailPh,   type: "email" },
                    { key: "subject", label: t.subject, ph: t.subjectPh, type: "text"  },
                  ].map(({ key, label, ph, type }) => (
                    <div key={key}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                        {label}
                      </label>
                      <input
                        type={type}
                        name={key}
                        value={form[key as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={ph}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      {t.message}
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t.messagePh}
                      rows={5}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-xs font-bold">{t.error}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={status === "sending" || !form.name || !form.email || !form.message}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                  >
                    {status === "sending" ? t.sending : t.send}
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}