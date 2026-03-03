import json
import os
from datetime import datetime
import random
import re
import requests
import time
from dotenv import load_dotenv

load_dotenv()

# API Key Havuzu
API_KEYS = [os.getenv("GEMINI_API_KEY_1"), os.getenv("GEMINI_API_KEY_2"), os.getenv("GEMINI_API_KEY")]
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0

# Keşfettiğimiz ve çalışan kesin modeller
MODELS_TO_TRY = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-2.5-flash-lite",
    "models/gemini-2.0-flash-lite",
    "models/gemini-2.5-pro"
]

def get_next_filename(directory):
    if not os.path.exists(directory):
        return "storie-002.json"
    files = [f for f in os.listdir(directory) if f.startswith("storie-") and f.endswith(".json")]
    numbers = set()
    for f in files:
        m = re.search(r"storie-(\d+)", f)
        if m:
            numbers.add(int(m.group(1)))
    next_number = 2
    while next_number in numbers:
        next_number += 1
    padding = max(3, len(str(next_number)))
    return f"storie-{next_number:0{padding}d}.json"

def call_gemini(prompt, api_key, model_path):
    url = f"https://generativelanguage.googleapis.com/v1/{model_path}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
        }
    }
    return requests.post(url, json=payload, timeout=90)

def generate_story():
    global current_key_index
    if not API_KEYS:
        print("❌ HATA: API key bulunamadı!")
        return

    weekday = datetime.now().weekday()
    levels_map = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a2"}
    current_level = levels_map.get(weekday, "a1")

    level_specs = {
        "a1": "Basit ve kısa cümleler. Tanışma, temel ihtiyaçlar. Hedef: ~150-200 kelime.",
        "a2": "Geçmiş zaman (Perfekt) ve şimdiki zaman karışık. Hedef: ~250-350 kelime.",
        "b1": "Resmi yazışmalar, vlog tadında anlatımlar. Hedef: ~400-500 kelime.",
        "b2": "Akademik ve profesyonel tartışmalar. Hedef: ~550-650 kelime.",
        "c1": "Çok katmanlı akademik analizler. Hedef: ~750-900 kelime."
    }

    topic_pool = [
        "Geschichte: Die Berliner Mauer, Münchens Wiederaufbau nach 1945",
        "Kultur: Oktoberfest Geschichte, deutsche Feiertage",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Pfandsystem",
        "Transport: Deutschlandticket, Fahrradstädte, Deutsche Bahn",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Rundfunkbeitrag"
    ]
    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
Sen bir Goethe/Telc dil sınavı uzmanısın. {current_level.upper()} seviyesinde sınav formatına tam eşdeğer bir içerik üret.
SADECE JSON döndür, başka hiçbir şey yazma:
{{
  "id": "storie-ID",
  "youtubeId": "",
  "title": "Almanca Başlık",
  "summary": "NUR AUF DEUTSCH!",
  "text": ["Paragraf 1", "Paragraf 2", "Paragraf 3", "Paragraf 4"],
  "image_prompts": [
    "realistic photo, cinematic lighting, high quality",
    "realistic photo, cinematic lighting, high quality",
    "realistic photo, cinematic lighting, high quality",
    "realistic photo, cinematic lighting, high quality"
  ],
  "vocab": [
    {{
      "term": "Almanca Kelime",
      "type": "Nomen/Verb/Adj",
      "meaning_tr": "TR", "meaning_en": "EN", "meaning_es": "ES", "meaning_ua": "UA",
      "example": "Almanca örnek cümle"
    }}
  ],
  "questions": [
    {{ "question": "Soru", "options": ["A", "B", "C", "D"], "answer": "Doğru" }}
  ]
}}
(Konu: {selected_topics}, Seviye: {level_specs[current_level]})
"""

    for model_path in MODELS_TO_TRY:
        key = API_KEYS[current_key_index]
        try:
            print(f"🚀 Deneniyor: {model_path} | Key: {current_key_index + 1}")
            response = call_gemini(prompt, key, model_path)
            if response.status_code == 200:
                res_json = response.json()
                raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if not json_match: continue
                data = json.loads(json_match.group(0).strip())
                save_dir = os.path.join("src", "data", "stories", "de", current_level)
                file_name = get_next_filename(save_dir)
                file_path = os.path.join(save_dir, file_name)
                data["id"] = file_name.replace(".json", "")
                os.makedirs(save_dir, exist_ok=True)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"✅ BAŞARILI: {file_path}")
                return 
            elif response.status_code == 429:
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                time.sleep(2)
        except: continue
    print("🚨 TÜM DENEMELER BAŞARISIZ.")

if __name__ == "__main__":
    generate_story()