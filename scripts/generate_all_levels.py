import google.generativeai as genai
import json
import os
from datetime import datetime

# API Key'i GitHub Secrets'tan alıyoruz
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_story():
    # Bugün haftanın kaçıncı günü? (0=Pazartesi, 1=Salı, ..., 6=Pazar)
    weekday = datetime.now().weekday()
    
    # Haftalık Plan Tanımı
    # Cumartesi (5) ve Pazar (6) için boş dönüyoruz
    plan = {
        0: {"level": "a1", "focus": "Basit tanışma ve günlük rutinler."},
        1: {"level": "a2", "focus": "Münih'te ulaşım ve Deutschlandticket kullanımı."},
        2: {"level": "b1", "focus": "Almanya'da çevre koruma ve sürdürülebilirlik."},
        3: {"level": "b2", "focus": "Alman iş kültürü ve profesyonel yazışmalar."},
        4: {"level": "c1", "focus": "Felsefi tartışmalar ve karmaşık Alman edebiyatı."}
    }

    if weekday not in plan:
        print("Bugün hafta sonu, üretim yapılmayacak.")
        return

    current_task = plan[weekday]
    level = current_task["level"]
    focus = current_task["focus"]

    prompt = f"""
    Sen profesyonel bir Almanca öğretmenisin. {level.upper()} seviyesinde bir içerik hazırla.
    Konu: {focus}
    Lütfen SADECE şu JSON formatında yanıt ver (stories001.json yapısına birebir uy):
    {{
      "id": "{level}-{datetime.now().strftime('%Y%m%d')}",
      "title": "...",
      "summary": "...",
      "text": ["..."],
      "vocab": [{{ "term": "...", "type": "...", "meaning_tr": "...", "meaning_en": "...", "example": "..." }}],
      "questions": [{{ "question": "...", "options": ["...", "..."], "answer": "..." }}]
    }}
    """
    
    response = model.generate_content(prompt)
    raw_text = response.text.strip()
    if "```json" in raw_text:
        raw_text = raw_text.split("```json")[1].split("```")[0].strip()
    
    data = json.loads(raw_text)
    
    # Mevcut klasörüne kaydet
    save_path = f"src/data/stories/de/{level}"
    file_name = f"auto-{datetime.now().strftime('%Y-%m-%d')}.json"
    
    os.makedirs(save_path, exist_ok=True)
    with open(os.path.join(save_path, file_name), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ {level.upper()} hikayesi başarıyla eklendi.")

if __name__ == "__main__":
    generate_story()
