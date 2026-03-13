import { Metadata } from "next";
import ContactClient from "./ContactClient";

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

// ── Zorunlu: output: export config için ────────────────────────────────────
export async function generateStaticParams() {
  return [
    { lang: "en" }, { lang: "tr" }, { lang: "de" }, { lang: "uk" }, { lang: "es" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = "https://memorlex.com";

  const titles: Record<string, string> = {
    tr: "İletişim | Memorlex",
    en: "Contact | Memorlex",
    de: "Kontakt | Memorlex",
    uk: "Контакт | Memorlex",
    es: "Contacto | Memorlex",
  };

  const descs: Record<string, string> = {
    tr: "Memorlex ekibiyle iletişime geçin. Soru, öneri ve geri bildirimleriniz için buradayız.",
    en: "Get in touch with the Memorlex team. We're here for your questions, suggestions and feedback.",
    de: "Kontaktieren Sie das Memorlex-Team. Wir sind für Ihre Fragen, Vorschläge und Feedback da.",
    uk: "Зв'яжіться з командою Memorlex. Ми тут для ваших запитань та відгуків.",
    es: "Contacta con el equipo de Memorlex. Estamos aquí para tus preguntas, sugerencias y comentarios.",
  };

  return {
    title: titles[lang] || titles.en,
    description: descs[lang] || descs.en,
    alternates: {
      canonical: `${baseUrl}/${lang}/contact`,
      languages: {
        tr: `${baseUrl}/tr/contact`,
        en: `${baseUrl}/en/contact`,
        de: `${baseUrl}/de/contact`,
        uk: `${baseUrl}/uk/contact`,
        es: `${baseUrl}/es/contact`,
        "x-default": `${baseUrl}/en/contact`,
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <ContactClient lang={lang as ValidLangs} />;
}