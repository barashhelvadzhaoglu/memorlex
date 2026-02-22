import google.generativeai as genai
import json
import os
from datetime import datetime
import random

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# 404 hatasını önlemek için model ismini doğrudan string olarak ve v1 sürümüyle uyumlu veriyoruz
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_story():
    weekday = datetime.now().weekday()
    
    # Seviye Haritası (Hafta sonu için de a1 tanımlandı)
    levels = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a1"}
    current_level = levels.get(weekday, "a1")

    # Senin zengin konu havuzun
    topic_pool = [
        "Geschichte: Münchens Wiederaufbau nach 1945, Der Kölner Dom",
        "Kultur: Oktoberfest Traditionen, Die deutsche Brotkultur",
        "Alltag: Sonntagsruhe in Deutschland, Vereinsleben",
        "Wissenschaft: Albert Einstein und Max Planck, Die Automobilgeschichte",
        "Transport: Das Deutschlandticket, Radfahren in München",
        "Bürokratie: Das KVR in München, Elterngeld und Kindergeld",
        "Bildung: Kita-Alltag in Bayern, Das duale Ausbildungssystem"
    ]

    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
    Sen bir Almanca sınav uzmanısın. {current_level.upper()} seviyesinde içerik hazırla.
    KONULAR: {selected_topics}
    KİŞİSELLEŞTİRME: Münih'te yaşayan, 1 ve 5 yaşlarında çocukları olan bir mühendis baba. Deutschlandticket detayı ekle.
    
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
        
        # GÖRSELDEKİ TAM DOSYA YOLU: src/data/stories/de/{seviye}
        save_dir = os.path.join("src", "data", "stories", "de", current_level)
        file_name = f"auto-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, file_name)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {file_path} dosyası oluşturuldu.")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        raise e

if __name__ == "__main__":
    generate_story()
