import google.generativeai as genai
import json
import os
from datetime import datetime
import random

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# 404 hatasını önlemek için model ismini daha geniş uyumlu hale getirdik
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_story():
    weekday = datetime.now().weekday()
    
    # Hafta sonu KeyError: 6 hatasını engellemek için tüm günler tanımlandı
    levels = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a1"}
    current_level = levels.get(weekday, "a1")

    # Zengin Konu Havuzu (Hepsini korudum)
    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau nach 1945",
        "Kultur: Oktoberfest Geschichte, Karneval im Rheinland, deutsche Feiertage",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Vereinsleben, Ehrenamt",
        "Wissenschaft: Berühmte deutsche Erfinder (Gutenberg, Benz, Einstein)",
        "Gesundheit: Das deutsche Gesundheitssystem, Hausarztmodell, Versicherung",
        "Technologie: Die Zukunft der Robotik, KI in deutschen Firmen, Industrie 4.0",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Steuererklärung",
        "Sport: Die Geschichte der Bundesliga, Wandersport, Fitness-Trends",
        "Transport: Geschichte der Autobahn, Deutschlandticket, Deutsche Bahn"
    ]

    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
    Sen bir Almanca sınav uzmanısın. {current_level.upper()} seviyesinde, hem Okuma hem Dinleme için içerik hazırla.
    KONULAR: {selected_topics}
    KİŞİSELLEŞTİRME: Münih'te yaşayan, çocukları olan mühendis bir baba perspektifi.
    FORMAT: Saat, fiyat, tarih ve peron numarası gibi sınav verileri içermeli.
    
    CEVABI SADECE JSON OLARAK VER:
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
        {{ "question": "Soru", "options": ["A", "B", "C", "D"], "answer": "Doğru" }}
      ]
    }}
    """

    try:
        # 404 hatasını önlemek için model nesnesini tekrar kontrol ederek çağırıyoruz
        response = model.generate_content(prompt)
        content = response.text.strip()
        
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
            
        print(f"✅ Başarılı: {current_level.upper()} klasörüne {file_name} yazıldı.")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        # Önemli: Hata aldığımızda workflow'un fail olduğunu görmemiz için hatayı yükseltiyoruz
        raise e

if __name__ == "__main__":
    generate_story()
