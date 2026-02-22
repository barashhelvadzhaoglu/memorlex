import google.generativeai as genai
import json
import os
from datetime import datetime
import random
import re

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def get_latest_flash_model():
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        flash_models = [n for n in models if 'flash' in n]
        return sorted(flash_models, reverse=True)[0] if flash_models else 'gemini-1.5-flash'
    except:
        return 'gemini-1.5-flash'

def get_next_filename(directory):
    if not os.path.exists(directory):
        return "storie-001.json"
    files = [f for f in os.listdir(directory) if f.startswith("storie-") and f.endswith(".json")]
    if not files:
        return "storie-001.json"
    numbers = [int(re.search(r"storie-(\d+)", f).group(1)) for f in files if re.search(r"storie-(\d+)", f)]
    next_number = max(numbers) + 1 if numbers else 1
    padding = max(3, len(str(next_number)))
    return f"storie-{next_number:0{padding}d}.json"

model = genai.GenerativeModel(get_latest_flash_model())

def generate_story():
    weekday = datetime.now().weekday()
    levels_map = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "b2"}
    current_level = levels_map.get(weekday, "a1")

    # Seviye Bazlı Kelime ve Yapı Kriterleri
    level_specs = {
        "a1": {"desc": "Çok basit cümleler, temel ihtiyaç kelimeleri.", "length": "~150 kelime"},
        "a2": {"desc": "Perfekt anlatımları, günlük anonslar ve temel bağlaçlar.", "length": "~250 kelime"},
        "b1": {"desc": "Resmi ve sosyal yaşam karışımı, yan cümleler.", "length": "~400 kelime"},
        "b2": {"desc": "Gazete makalesi veya profesyonel sunum tadında zengin anlatım.", "length": "~550 kelime"},
        "c1": {"desc": "Akademik analiz, tarihsel perspektif, üst düzey deyimler.", "length": "~750 kelime"}
    }

    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau nach 1945",
        "Kultur: Oktoberfest Geschichte, Karneval im Rheinland, deutsche Brotkultur",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Vereinsleben, Pfandsystem",
        "Wissenschaft: Berühmte deutsche Erfinder (Gutenberg, Benz, Einstein)",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Rundfunkbeitrag",
        "Transport: Deutschlandticket, Fahrradstädte, Deutsche Bahn Herausforderungen",
        "Wohnen: Mietverträge, Mieterrechte, Kehrwoche",
        "Bildung: Das duale Ausbildungssystem, Studium an einer TU"
    ]

    # İki konuyu harmanla
    selected_topics = random.sample(topic_pool, 2)
    
    prompt = f"""
    Sen bir Goethe/Telc sınav uzmanısın. {current_level.upper()} seviyesinde bir içerik üret.
    
    TALİMATLAR:
    1. KONU: Şu iki konuyu harmanla: {selected_topics}.
    2. PERSPEKTİF: Münih'te yaşayan, 1 ve 5 yaşlarında çocukları olan bir mühendis baba. Şehri Deutschlandticket ile çocuklarıyla gezerken keşfetsin.
    3. SINAV VERİSİ: Metne mutlaka saat, fiyat, tarih ve peron numarası gibi somut 'tuzak' bilgiler ekle.
    4. YOUTUBE ODAĞI: Seslendirme (Voiceover) için akıcı, doğal ve ilgi çekici bir dil kullan.
    5. SEVİYE DETAYI: {level_specs[current_level]['desc']} Hedef uzunluk: {level_specs[current_level]['length']}.
    6. TEKNİK UYARI: Karakter mühendis olsa da KESİNLİKLE IT/Network Security teknik detaylarına girme.

    JSON FORMATI:
    {{
      "id": "storie-ID",
      "youtubeId": "",
      "title": "Başlık",
      "summary": "Türkçe Özet",
      "text": ["Paragraflar..."],
      "vocab": [{{ "term": "K", "type": "T", "meaning_tr": "TR", "meaning_en": "EN", "example": "E" }}],
      "questions": [{{ "question": "S", "options": ["A", "B", "C", "D"], "answer": "Doğru" }}]
    }}
    (En az 15-20 kelime ve 8-10 soru ekle.)
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = json.loads(content)
        
        save_dir = os.path.join("src", "data", "stories", "de", current_level)
        file_name = get_next_filename(save_dir)
        file_path = os.path.join(save_dir, file_name)
        
        data["id"] = file_name.replace(".json", "")
        
        os.makedirs(save_dir, exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {file_path} yazıldı. (Seviye: {current_level.upper()}, Konular: {selected_topics})")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        raise e

if __name__ == "__main__":
    generate_story()
