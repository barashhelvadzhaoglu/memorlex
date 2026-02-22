import google.generativeai as genai
import json
import os
from datetime import datetime
import random

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# 404 hatası için: 'models/' ön ekini kaldırıp en saf haliyle deniyoruz
# SDK bunu otomatik olarak doğru endpoint'e (v1beta veya v1) yönlendirecektir.
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_story():
    weekday = datetime.now().weekday()
    # Pazar = 6. Hafta sonu hatasını (KeyError: 6) engellemek için:
    levels = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a1"}
    current_level = levels.get(weekday, "a1")

    # Konu havuzun (Münih ve çocuklarınla ilgili detaylar dahil)
    topic_pool = [
        "Geschichte: Münchens Wiederaufbau, Der Kölner Dom",
        "Kultur: Die deutsche Brotkultur, Oktoberfest Traditionen",
        "Alltag: Deutschlandticket Reisen, Sonntagsruhe",
        "Wissenschaft: Albert Einstein, Automobilgeschichte in Deutschland"
    ]

    selected_topics = random.sample(topic_pool, 1)

    prompt = f"""
    Sen bir Almanca uzmanısın. {current_level.upper()} seviyesinde içerik hazırla.
    KONU: {selected_topics}. 
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
        
        # JSON temizleme
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = json.loads(content)
        
        # Ekran görüntüsündeki yapıya tam uyum: src/data/stories/de/{level}
        save_dir = os.path.join("src", "data", "stories", "de", current_level)
        file_name = f"auto-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, file_name)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {file_path}")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        raise e

if __name__ == "__main__":
    generate_story()
