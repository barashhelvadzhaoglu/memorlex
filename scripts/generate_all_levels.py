import google.generativeai as genai
import json
import os
from datetime import datetime
import random

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Model tanımlaması
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_story():
    weekday = datetime.now().weekday()
    
    # Hafta sonu dahil tüm günleri kapsayan seviye haritası
    levels = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a1"}
    current_level = levels.get(weekday, "a1")

    # Zengin Konu Havuzu (Eğitim, Sağlık, Teknoloji, Tarih vb.)
    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau",
        "Kultur: Oktoberfest, deutsche Feiertage, Die deutsche Brotkultur",
        "Alltag: Mülltrennung, Sonntagsruhe, Vereinsleben, Pfandsystem",
        "Wissenschaft: Berühmte Erfinder (Gutenberg, Einstein), Max-Planck-Institut",
        "Physik & Chemie: Entdeckung der Röntgenstrahlen, Chemie im Alltag",
        "Technologie: Robotik, KI in Deutschland, Industrie 4.0",
        "Gesundheit: Gesundheitssystem, Hausarztmodell, Krankenversicherung",
        "Sport: Bundesliga, Wandersport, Olympia 1972 in München",
        "Geographie: Die Alpen, Nordsee, Unterschiede Nord/Süddeutschland",
        "Bürokratie: KVR Anmeldung, Elterngeld, Steuererklärung",
        "Bildung: Duales System, Kita-Alltag, Schulpflicht",
        "Wirtschaft: Automobilgeschichte (BMW, Mercedes), Der Mittelstand",
        "Transport: Autobahn Geschichte, Deutschlandticket, Deutsche Bahn"
    ]

    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
    Sen bir Almanca sınav uzmanısın. {current_level.upper()} seviyesinde içerik hazırla.
    KONULAR: {selected_topics}
    KİŞİSELLEŞTİRME: Münih'te yaşayan, çocukları olan bir mühendis baba. Deutschlandticket detayı ekle.
    
    CEVABI SADECE JSON FORMATINDA VER:
    {{
      "id": "story-{current_level}-{datetime.now().strftime('%Y%m%d')}",
      "youtubeId": "", 
      "title": "Almanca Başlık",
      "summary": "Türkçe özet",
      "text": ["Paragraf 1", "Paragraf 2"],
      "vocab": [
        {{ "term": "Kelime", "type": "Nomen/Verb/Adj", "meaning_tr": "Türkçe", "meaning_en": "İngilizce", "example": "Örnek" }}
      ],
      "questions": [
        {{ "question": "Soru", "options": ["A", "B", "C", "D"], "answer": "Doğru Şık" }}
      ]
    }}
    KRİTER: 18-20 vocab, 8-10 soru.
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        # JSON temizleme
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = json.loads(content)
        
        save_dir = f"src/data/stories/de/{current_level}"
        file_name = f"auto-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        os.makedirs(save_dir, exist_ok=True)
        with open(os.path.join(save_dir, file_name), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {current_level.upper()} klasörüne yazıldı.")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        raise e

if __name__ == "__main__":
    generate_story()
