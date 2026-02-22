import google.generativeai as genai
import json
import os
from datetime import datetime
import random

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def get_latest_flash_model():
    """API'deki en güncel flash model ismini bulur."""
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        # Önce 2.0 (Gemini 3 serisi gibi düşünebilirsin), yoksa 1.5 arar
        flash_models = [n for n in models if 'flash' in n]
        if flash_models:
            # En güncelini (genelde listenin başında veya özel isimlendirmede) seçer
            return sorted(flash_models, reverse=True)[0] 
        return 'gemini-1.5-flash' # Fallback
    except:
        return 'gemini-1.5-flash'

selected_model = get_latest_flash_model()
print(f"🚀 Seçilen En Yeni Model: {selected_model}")
model = genai.GenerativeModel(selected_model)

def generate_story():
    weekday = datetime.now().weekday()
    # Pazar = 6 için güvenli geçiş
    levels = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a1"}
    current_level = levels.get(weekday, "a1")

    topic_pool = [
        "Geschichte: Münchens Wiederaufbau, Der Kölner Dom",
        "Kultur: Oktoberfest Traditionen, Brotkultur",
        "Alltag: Deutschlandticket Abenteuer, Sonntagsruhe",
        "Transport: U-Bahn München, Reisen mit Kindern"
    ]

    prompt = f"""
    Sen bir Almanca uzmanısın. {current_level.upper()} seviyesinde içerik hazırla.
    KONU: {random.choice(topic_pool)}. 
    KİŞİSELLEŞTİRME: Münih'te yaşayan, 1 ve 5 yaşlarında çocukları olan bir baba.
    CEVABI SADECE JSON OLARAK VER:
    {{
      "id": "story-{current_level}-{datetime.now().strftime('%Y%m%d')}",
      "title": "Almanca Başlık",
      "summary": "Türkçe özet",
      "text": ["Paragraf 1"],
      "vocab": [{{ "term": "Kelime", "type": "Nomen", "meaning_tr": "TR", "meaning_en": "EN", "example": "Örnek" }}],
      "questions": [{{ "question": "Soru", "options": ["A", "B", "C", "D"], "answer": "A" }}]
    }}
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        
        data = json.loads(content)
        
        # Klasör yapısı: src/data/stories/de/{level}
        save_dir = os.path.join("src", "data", "stories", "de", current_level)
        file_name = f"auto-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, file_name)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {file_path} yazıldı.")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        raise e

if __name__ == "__main__":
    generate_story()
