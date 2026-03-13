import { Metadata } from "next";
import Link from "next/link";

type ValidLangs = "en" | "tr" | "de" | "uk" | "es";

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
    tr: "Gizlilik Politikası | Memorlex",
    en: "Privacy Policy | Memorlex",
    de: "Datenschutzerklärung | Memorlex",
    uk: "Політика Конфіденційності | Memorlex",
    es: "Política de Privacidad | Memorlex",
  };

  const descs: Record<string, string> = {
    tr: "Memorlex gizlilik politikası — kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgi.",
    en: "Memorlex privacy policy — how we collect, use and protect your personal data.",
    de: "Memorlex Datenschutzerklärung — wie wir Ihre persönlichen Daten erheben, verwenden und schützen.",
    uk: "Політика конфіденційності Memorlex — як ми збираємо, використовуємо та захищаємо ваші персональні дані.",
    es: "Política de privacidad de Memorlex — cómo recopilamos, usamos y protegemos sus datos personales.",
  };

  return {
    title: titles[lang] || titles.en,
    description: descs[lang] || descs.en,
    alternates: {
      canonical: `${baseUrl}/${lang}/privacy`,
      languages: {
        tr: `${baseUrl}/tr/privacy`,
        en: `${baseUrl}/en/privacy`,
        de: `${baseUrl}/de/privacy`,
        uk: `${baseUrl}/uk/privacy`,
        es: `${baseUrl}/es/privacy`,
        "x-default": `${baseUrl}/en/privacy`,
      },
    },
  };
}

// ── İçerik ──────────────────────────────────────────────────────────────────
const CONTENT: Record<ValidLangs, {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
  contactTitle: string;
  contactBody: string;
  backLabel: string;
}> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: January 2025",
    sections: [
      {
        heading: "1. Introduction",
        body: "Welcome to Memorlex (memorlex.com). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.",
      },
      {
        heading: "2. Information We Collect",
        body: "We may collect information you voluntarily provide to us, such as your name and email address when you use our contact form. We also automatically collect certain information when you visit our site, including your IP address, browser type, operating system, referring URLs, and pages visited. This information is collected through cookies and similar tracking technologies.",
      },
      {
        heading: "3. Google AdSense & Cookies",
        body: "Memorlex uses Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google's Ads Settings at https://adssettings.google.com. We also use Google Analytics to understand how visitors interact with our website. Both services may collect and process data in accordance with Google's Privacy Policy (https://policies.google.com/privacy).",
      },
      {
        heading: "4. How We Use Your Information",
        body: "We use the information we collect to: operate and maintain our website; improve and personalize your experience; respond to your inquiries and contact form submissions; display relevant advertisements through Google AdSense; analyze usage patterns to improve our content and services; and comply with legal obligations.",
      },
      {
        heading: "5. Cookies",
        body: "Cookies are small text files stored on your device. We use cookies to: keep track of your preferences; analyze site traffic; and enable advertising features. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, some parts of this website may become inaccessible or not function properly.",
      },
      {
        heading: "6. Third-Party Services",
        body: "Our website may contain links to third-party websites and services, including YouTube, Google, and Formspree. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.",
      },
      {
        heading: "7. Data Retention",
        body: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Contact form submissions are retained for up to 12 months.",
      },
      {
        heading: "8. Your Rights",
        body: "Depending on your location, you may have certain rights regarding your personal data, including the right to access, correct, or delete your personal information. To exercise these rights, please contact us at info@memorlex.com.",
      },
      {
        heading: "9. Children's Privacy",
        body: "Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.",
      },
      {
        heading: "10. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated date. Your continued use of our website after any changes constitutes your acceptance of the new Privacy Policy.",
      },
    ],
    contactTitle: "Contact Us",
    contactBody: "If you have questions about this Privacy Policy, please contact us at info@memorlex.com or use our contact form.",
    backLabel: "← Back to Home",
  },
  tr: {
    title: "Gizlilik Politikası",
    updated: "Son güncelleme: Ocak 2025",
    sections: [
      {
        heading: "1. Giriş",
        body: "Memorlex'e (memorlex.com) hoş geldiniz. Kişisel bilgilerinizi ve gizlilik hakkınızı korumaya kararlıyız. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.",
      },
      {
        heading: "2. Topladığımız Bilgiler",
        body: "İletişim formunu kullandığınızda adınız ve e-posta adresiniz gibi gönüllü olarak sağladığınız bilgileri toplayabiliriz. Ayrıca sitemizi ziyaret ettiğinizde IP adresiniz, tarayıcı türünüz, işletim sisteminiz, yönlendiren URL'ler ve ziyaret edilen sayfalar gibi bilgileri otomatik olarak toplarız. Bu bilgiler çerezler ve benzeri izleme teknolojileri aracılığıyla toplanır.",
      },
      {
        heading: "3. Google AdSense ve Çerezler",
        body: "Memorlex, reklam göstermek için Google AdSense kullanmaktadır. Google AdSense, web sitemize veya diğer web sitelerine yaptığınız önceki ziyaretlere dayalı reklamlar sunmak için çerezler kullanır. Google'ın reklam ayarlarından kişiselleştirilmiş reklamları devre dışı bırakabilirsiniz: https://adssettings.google.com. Ziyaretçilerin sitemizle nasıl etkileşime geçtiğini anlamak için Google Analytics de kullanmaktayız. Her iki hizmet de Google'ın Gizlilik Politikası kapsamında veri toplayabilir ve işleyebilir.",
      },
      {
        heading: "4. Bilgilerinizi Nasıl Kullanıyoruz",
        body: "Topladığımız bilgileri şu amaçlarla kullanırız: web sitemizi işletmek ve sürdürmek; deneyiminizi iyileştirmek ve kişiselleştirmek; sorularınıza ve iletişim formu gönderilerinize yanıt vermek; Google AdSense aracılığıyla ilgili reklamlar göstermek; içerik ve hizmetlerimizi geliştirmek için kullanım modellerini analiz etmek; ve yasal yükümlülüklere uymak.",
      },
      {
        heading: "5. Çerezler",
        body: "Çerezler, cihazınızda depolanan küçük metin dosyalarıdır. Tercihlerinizi kaydetmek, site trafiğini analiz etmek ve reklam özelliklerini etkinleştirmek için çerezler kullanırız. Tarayıcınızı tüm veya bazı çerezleri reddedecek şekilde ayarlayabilirsiniz. Çerezleri devre dışı bırakırsanız, web sitemizin bazı bölümleri erişilemez hale gelebilir.",
      },
      {
        heading: "6. Üçüncü Taraf Hizmetler",
        body: "Web sitemiz YouTube, Google ve Formspree dahil üçüncü taraf web sitelerine ve hizmetlere bağlantılar içerebilir. Bu üçüncü tarafların gizlilik uygulamalarından sorumlu değiliz. Herhangi bir kişisel bilgi sağlamadan önce gizlilik politikalarını incelemenizi öneririz.",
      },
      {
        heading: "7. Veri Saklama",
        body: "Kişisel bilgilerinizi yalnızca bu Gizlilik Politikasında belirtilen amaçları yerine getirmek için gerekli olduğu sürece saklarız. İletişim formu gönderimleri en fazla 12 ay süreyle saklanır.",
      },
      {
        heading: "8. Haklarınız",
        body: "Konumunuza bağlı olarak, kişisel verilerinize erişim, düzeltme veya silme hakkı dahil çeşitli haklara sahip olabilirsiniz. Bu hakları kullanmak için info@memorlex.com adresinden bizimle iletişime geçebilirsiniz.",
      },
      {
        heading: "9. Çocukların Gizliliği",
        body: "Web sitemiz 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki çocuklardan bilerek kişisel bilgi toplamıyoruz. Böyle bir bilgiyi yanlışlıkla topladığımıza inanıyorsanız lütfen hemen bizimle iletişime geçin.",
      },
      {
        heading: "10. Politika Değişiklikleri",
        body: "Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Değişiklikler güncellenmiş tarihle bu sayfada yayınlanacaktır. Web sitemizi kullanmaya devam etmeniz, yeni Gizlilik Politikasını kabul ettiğiniz anlamına gelir.",
      },
    ],
    contactTitle: "İletişim",
    contactBody: "Bu Gizlilik Politikası hakkında sorularınız için info@memorlex.com adresinden veya iletişim formu aracılığıyla bize ulaşabilirsiniz.",
    backLabel: "← Ana Sayfaya Dön",
  },
  de: {
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert: Januar 2025",
    sections: [
      {
        heading: "1. Einleitung",
        body: "Willkommen bei Memorlex (memorlex.com). Wir sind dem Schutz Ihrer persönlichen Daten und Ihrem Recht auf Privatsphäre verpflichtet. Diese Datenschutzerklärung erläutert, wie wir Ihre Informationen erfassen, verwenden und schützen, wenn Sie unsere Website besuchen.",
      },
      {
        heading: "2. Erhobene Informationen",
        body: "Wir können Informationen erfassen, die Sie uns freiwillig mitteilen, z. B. Ihren Namen und Ihre E-Mail-Adresse über unser Kontaktformular. Außerdem erfassen wir automatisch bestimmte Informationen, wenn Sie unsere Website besuchen, einschließlich Ihrer IP-Adresse, des Browsertyps, des Betriebssystems und der besuchten Seiten.",
      },
      {
        heading: "3. Google AdSense & Cookies",
        body: "Memorlex verwendet Google AdSense zur Anzeige von Werbung. Google AdSense verwendet Cookies, um Anzeigen basierend auf Ihren früheren Besuchen auf unserer oder anderen Websites zu schalten. Sie können personalisierte Werbung unter https://adssettings.google.com deaktivieren. Wir verwenden auch Google Analytics gemäß der Datenschutzrichtlinie von Google (https://policies.google.com/privacy).",
      },
      {
        heading: "4. Verwendung Ihrer Daten",
        body: "Wir verwenden die erhobenen Informationen, um unsere Website zu betreiben, Ihre Erfahrung zu verbessern, auf Ihre Anfragen zu antworten, relevante Werbung über Google AdSense anzuzeigen und Nutzungsmuster zu analysieren.",
      },
      {
        heading: "5. Cookies",
        body: "Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Wir verwenden Cookies, um Ihre Einstellungen zu speichern, den Website-Traffic zu analysieren und Werbefunktionen zu aktivieren. Sie können Ihren Browser so einstellen, dass er alle oder einige Cookies ablehnt.",
      },
      {
        heading: "6. Drittanbieter",
        body: "Unsere Website kann Links zu Drittanbieter-Websites enthalten, darunter YouTube, Google und Formspree. Wir sind nicht für deren Datenschutzpraktiken verantwortlich.",
      },
      {
        heading: "7. Datenspeicherung",
        body: "Wir speichern Ihre personenbezogenen Daten nur so lange, wie es zur Erfüllung der in dieser Datenschutzerklärung dargelegten Zwecke erforderlich ist. Kontaktformulareinsendungen werden bis zu 12 Monate aufbewahrt.",
      },
      {
        heading: "8. Ihre Rechte",
        body: "Sie haben das Recht auf Auskunft, Berichtigung oder Löschung Ihrer personenbezogenen Daten. Bitte kontaktieren Sie uns unter info@memorlex.com.",
      },
      {
        heading: "9. Datenschutz für Kinder",
        body: "Unsere Website richtet sich nicht an Kinder unter 13 Jahren. Wir erfassen wissentlich keine personenbezogenen Daten von Kindern unter 13 Jahren.",
      },
      {
        heading: "10. Änderungen dieser Richtlinie",
        body: "Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Änderungen werden auf dieser Seite mit einem aktualisierten Datum veröffentlicht.",
      },
    ],
    contactTitle: "Kontakt",
    contactBody: "Bei Fragen zu dieser Datenschutzerklärung kontaktieren Sie uns bitte unter info@memorlex.com oder über unser Kontaktformular.",
    backLabel: "← Zur Startseite",
  },
  uk: {
    title: "Політика Конфіденційності",
    updated: "Останнє оновлення: січень 2025",
    sections: [
      {
        heading: "1. Вступ",
        body: "Ласкаво просимо до Memorlex (memorlex.com). Ми зобов'язані захищати вашу особисту інформацію та ваше право на конфіденційність. Ця Політика конфіденційності пояснює, як ми збираємо, використовуємо та захищаємо вашу інформацію.",
      },
      {
        heading: "2. Інформація, яку ми збираємо",
        body: "Ми можемо збирати інформацію, яку ви добровільно надаєте через контактну форму. Також ми автоматично збираємо певну інформацію під час відвідування сайту: IP-адресу, тип браузера, операційну систему та переглянуті сторінки.",
      },
      {
        heading: "3. Google AdSense та файли cookie",
        body: "Memorlex використовує Google AdSense для показу реклами. Google AdSense використовує файли cookie для показу реклами на основі ваших попередніх відвідувань. Ви можете відмовитися від персоналізованої реклами на https://adssettings.google.com.",
      },
      {
        heading: "4. Використання вашої інформації",
        body: "Ми використовуємо зібрану інформацію для роботи та обслуговування нашого сайту, покращення вашого досвіду, відповіді на ваші запити та показу релевантної реклами.",
      },
      {
        heading: "5. Файли cookie",
        body: "Файли cookie — це невеликі текстові файли, що зберігаються на вашому пристрої. Ми використовуємо їх для збереження налаштувань, аналізу трафіку та рекламних функцій. Ви можете налаштувати браузер для відхилення файлів cookie.",
      },
      {
        heading: "6. Сторонні сервіси",
        body: "Наш сайт може містити посилання на сторонні сайти, включаючи YouTube, Google та Formspree. Ми не несемо відповідальності за їх практику конфіденційності.",
      },
      {
        heading: "7. Зберігання даних",
        body: "Ми зберігаємо вашу особисту інформацію лише стільки, скільки необхідно. Дані контактних форм зберігаються до 12 місяців.",
      },
      {
        heading: "8. Ваші права",
        body: "Ви маєте право на доступ, виправлення або видалення ваших персональних даних. Зв'яжіться з нами за адресою info@memorlex.com.",
      },
      {
        heading: "9. Конфіденційність дітей",
        body: "Наш сайт не призначений для дітей до 13 років. Ми свідомо не збираємо персональні дані дітей до 13 років.",
      },
      {
        heading: "10. Зміни цієї політики",
        body: "Ми можемо час від часу оновлювати цю Політику конфіденційності. Зміни будуть опубліковані на цій сторінці з оновленою датою.",
      },
    ],
    contactTitle: "Зв'яжіться з нами",
    contactBody: "Якщо у вас є запитання щодо цієї Політики конфіденційності, зв'яжіться з нами за адресою info@memorlex.com або через нашу контактну форму.",
    backLabel: "← На головну",
  },
  es: {
    title: "Política de Privacidad",
    updated: "Última actualización: enero de 2025",
    sections: [
      {
        heading: "1. Introducción",
        body: "Bienvenido a Memorlex (memorlex.com). Estamos comprometidos con la protección de su información personal y su derecho a la privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información cuando visita nuestro sitio web.",
      },
      {
        heading: "2. Información que recopilamos",
        body: "Podemos recopilar información que usted nos proporciona voluntariamente, como su nombre y dirección de correo electrónico a través de nuestro formulario de contacto. También recopilamos automáticamente cierta información cuando visita nuestro sitio, incluyendo su dirección IP, tipo de navegador y páginas visitadas.",
      },
      {
        heading: "3. Google AdSense y Cookies",
        body: "Memorlex utiliza Google AdSense para mostrar anuncios. Google AdSense usa cookies para mostrar anuncios basados en sus visitas anteriores a nuestro sitio u otros sitios web. Puede optar por no recibir publicidad personalizada en https://adssettings.google.com.",
      },
      {
        heading: "4. Cómo usamos su información",
        body: "Usamos la información recopilada para operar y mantener nuestro sitio web, mejorar su experiencia, responder a sus consultas, mostrar anuncios relevantes a través de Google AdSense y analizar patrones de uso.",
      },
      {
        heading: "5. Cookies",
        body: "Las cookies son pequeños archivos de texto almacenados en su dispositivo. Las usamos para guardar sus preferencias, analizar el tráfico del sitio y habilitar funciones publicitarias. Puede configurar su navegador para rechazar todas o algunas cookies.",
      },
      {
        heading: "6. Servicios de terceros",
        body: "Nuestro sitio web puede contener enlaces a sitios web y servicios de terceros, incluyendo YouTube, Google y Formspree. No somos responsables de sus prácticas de privacidad.",
      },
      {
        heading: "7. Retención de datos",
        body: "Conservamos su información personal solo durante el tiempo necesario. Los envíos del formulario de contacto se conservan hasta 12 meses.",
      },
      {
        heading: "8. Sus derechos",
        body: "Tiene derecho a acceder, corregir o eliminar su información personal. Contáctenos en info@memorlex.com para ejercer estos derechos.",
      },
      {
        heading: "9. Privacidad de los niños",
        body: "Nuestro sitio web no está dirigido a menores de 13 años. No recopilamos intencionalmente información personal de niños menores de 13 años.",
      },
      {
        heading: "10. Cambios en esta política",
        body: "Podemos actualizar esta Política de Privacidad periódicamente. Los cambios se publicarán en esta página con una fecha actualizada.",
      },
    ],
    contactTitle: "Contáctenos",
    contactBody: "Si tiene preguntas sobre esta Política de Privacidad, contáctenos en info@memorlex.com o use nuestro formulario de contacto.",
    backLabel: "← Volver al Inicio",
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const c = CONTENT[lang as ValidLangs] || CONTENT.en;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* ── Başlık ── */}
        <div className="mb-12">
          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-3">
            {c.title}
          </h1>
          <p className="text-slate-400 text-sm font-bold">{c.updated}</p>
        </div>

        {/* ── Bölümler ── */}
        <div className="space-y-8">
          {c.sections.map((section) => (
            <div
              key={section.heading}
              className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-sm font-black uppercase tracking-wide text-amber-500 mb-3">
                {section.heading}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* ── İletişim ── */}
        <div className="mt-10 p-6 bg-slate-900 dark:bg-white rounded-2xl">
          <h2 className="text-sm font-black uppercase tracking-wide text-amber-500 mb-3">
            {c.contactTitle}
          </h2>
          <p className="text-slate-300 dark:text-slate-700 text-sm leading-relaxed mb-4">
            {c.contactBody}
          </p>
          <a
            href="mailto:info@memorlex.com"
            className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            info@memorlex.com
          </a>
        </div>

        {/* ── Geri ── */}
        <div className="mt-10">
          <Link
            href={`/${lang}`}
            className="text-slate-400 hover:text-amber-500 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            {c.backLabel}
          </Link>
        </div>

      </div>
    </main>
  );
}