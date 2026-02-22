import google.generativeai as genai
import json
import os
from datetime import datetime
import random

# GitHub Secrets üzerinden API anahtarını alıyoruz
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_story():
    # 0=Pazartesi (A1), 1=Salı (A2), 2=Çarşamba (B1), 3=Perşembe (B2), 4=Cuma (C1)
    weekday = datetime.now().weekday()
    
    # Hafta sonu (Cumartesi=5, Pazar=6) ise üretim yapma
    if weekday > 4:
        print(f"Bugün günlerden {datetime.now().strftime('%A')}. Hafta sonu plan gereği üretim yapılmıyor.")
        return

    # Günlere göre seviye eşleşmesi
    levels = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1"}
    current_level = levels[weekday]

    # Dev Konu Havuzu: Tarih, Bilim, Spor, Teknoloji ve Günlük Yaşam
    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau nach 1945, Das Römische Reich am Rhein",
        "Städte: Hamburgs Speicherstadt, Industriekultur im Ruhrgebiet, Die Schlösser in Potsdam",
        "Kultur: Oktoberfest Geschichte, Karneval im Rheinland, deutsche Feiertage, Die deutsche Brotkultur",
        "Traditionen: Weihnachtsmärkte, Schützenfeste, Brauchtum in den Alpen (Almabtrieb)",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Vereinsleben, Ehrenamt, Pfandsystem in Deutschland",
        "Wohnen: Mietverträge, Mieterrechte, Kehrwoche in Baden-Württemberg, Energie sparen im Haushalt",
        "Wissenschaft: Berühmte deutsche Erfinder (Gutenberg, Benz, Einstein), Max-Planck-Institut",
        "Weltraum: Das deutsche Zentrum für Luft- und Raumfahrt (DLR), Alexander Gerst und die ISS",
        "Physik & Chemie: Die Entdeckung der Röntgenstrahlen, Quantenphysik für Anfänger, Chemie im Alltag",
        "Technologie: Die Zukunft der Robotik, Künstliche Intelligenz in deutschen Firmen, Industrie 4.0",
        "Gesundheit: Das deutsche Gesundheitssystem, Hausarztmodell, Krankenversicherung (TK/AOK), Heilpraktiker",
        "Sport: Die Geschichte der Bundesliga, Wandersport in Deutschland, Breitensport und Fitness-Trends",
        "Olympia: Legendäre deutsche Athleten, Die Olympischen Spiele 1972 in München",
        "Geographie: Die Alpen, die Nord- und Ostsee, Der Schwarzwald, Unterschiede zwischen Ost- und Westdeutschland",
        "Umwelt: Erneuerbare Energien, Klimaschutzziele in Deutschland, Der deutsche Wald und seine Bedeutung",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Rundfunkbeitrag (GEZ), Steuererklärung",
        "Bildung: Das duale Ausbildungssystem, Studium an einer TU (Technische Universität), Schulpflicht und Abitur",
        "Kinder: Kita-Alltag in Bayern, Märchen der Gebrüder Grimm, Kinderrechte in Deutschland",
        "Wirtschaft: Deutsche Automobilgeschichte (VW, BMW, Mercedes), Der Mittelstand olarak Rückgrat",
        "Transport: Geschichte der Autobahn, Deutschlandticket, Fahrradstädte wie Münster, Deutsche Bahn Herausforderungen"
    ]

    # Rastgele 2 konu seçimi
    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
    Sen bir Almanca dil sınavı (Goethe/Telc/TestDaF) uzmanı, tarihçi ve YouTube içerik üreticisisin.
    Lütfen {current_level.upper()} seviyesinde, hem OKUMA hem de YouTube videosu (DİNLEME/Hören) için uygun bir içerik hazırla.

    TALİMATLAR:
    1. KONU: Şu iki konuyu birbiriyle harmanlayarak anlat: {selected_topics}. 
       İçerik Almanya'nın kültürü, tarihi, bilimi veya günlük yaşamı hakkında olmalı. KESİNLİKLE IT/Network Security teknik detaylarına odaklanma.
    2. YOUTUBE ODAĞI: Metin, bir video seslendirmesi (Voiceover) için akıcı, doğal ve ilgi çekici olmalı.
    3. SINAV FORMATI: Goethe/Telc sınavlarındaki 'Hören' ve 'Lesen' bölümlerindeki gibi 'tuzak' bilgiler ve somut veriler (tarihler, fiyatlar, saatler, peron numaraları, kişi sayıları) ekle.
    4. KİŞİSELLEŞTİRME: Ana karakter Münih'te yaşayan, 1 ve 5 yaşında çocukları olan bir baba olsun. Şehri ve konuları çocuklarıyla Deutschlandticket kullanarak gezerken keşfetsin.
    5. ÇEŞİTLİLİK: Daha önceki üretimlerde kullanılan klişelerden kaçın, her seferinde özgün bir olay örgüsü kur.

    SEVİYE ÖZELİNDE DETAYLAR:
    - A1: Çok basit cümleler, temel ihtiyaç kelimeleri (~150 kelime).
    - A2: Geçmiş zaman (Perfekt) anlatımları, günlük anonslar ve temel bağlaçlar (~250 kelime).
    - B1: Resmi ve sosyal yaşamın karışımı, orta düzey dil yapıları ve yan cümleler (~400 kelime).
    - B2: Gazete makalesi, radyo programı veya profesyonel bir sunum tadında zengin anlatım (~550 kelime).
    - C1: Akademik analiz, tarihsel perspektif, toplumsal değişimler ve üst düzey deyimsel ifadeler (~750 kelime).

    SADECE VE SADECE ŞU JSON FORMATINDA CEVAP VER (Başka açıklama ekleme):
    {{
      "id": "story-{current_level}-{datetime.now().strftime('%Y%m%d')}",
      "youtubeId": "", 
      "title": "Almanca Başlık",
      "summary": "Hikayenin/Makalenin Türkçe kısa özeti",
      "text": ["Paragraf 1 (Doğal/Anlatım dili)", "Paragraf 2", "..."],
      "vocab": [
        {{ "term": "Almanca Kelime", "type": "Nomen/Verb/Adj/Phrase", "meaning_tr": "Türkçe karşılığı", "meaning_en": "İngilizce karşılığı", "example": "Metindeki kullanımı" }}
      ],
      "questions": [
        {{ "question": "Metinle ilgili Almanca soru", "options": ["A", "B", "C", "D"], "answer": "Doğru Şık" }}
      ]
    }}

    KRİTER: En az 18-20 arası kelime (vocab) ve 8-10 arası çoktan seçmeli soru (questions) ekle.
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        # Markdown kod bloklarını temizleme
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = json.loads(content)
        
        # Dosya yolu oluşturma: src/data/stories/de/{level}/auto-YYYY-MM-DD.json
        save_dir = f"src/data/stories/de/{current_level}"
        file_name = f"auto-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        os.makedirs(save_dir, exist_ok=True)
        with open(os.path.join(save_dir, file_name), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {current_level.upper()} seviyesi için '{file_name}' oluşturuldu.")

    except Exception as e:
        print(f"❌ Hata oluştu: {str(e)}")

if __name__ == "__main__":
    generate_story()
