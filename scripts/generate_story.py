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
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"), 
    os.getenv("GEMINI_API_KEY_2"), 
    os.getenv("GEMINI_API_KEY")
]
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0

# Discovery sonucunda kesinleşen güncel model listesi
MODELS_TO_TRY = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-2.5-flash-lite",
    "models/gemini-1.5-pro"
]

def get_next_filename(directory):
    """storie-001.json varsa atla, 002'den itibaren sıradaki boş numarayı bul."""
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
    """Direkt REST API v1 üzerinden çağrı yapar."""
    url = f"https://generativelanguage.googleapis.com/v1/{model_path}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
        }
    }
    response = requests.post(url, json=payload, timeout=90)
    return response

def generate_story():
    global current_key_index
    if not API_KEYS:
        print("❌ HATA: API key bulunamadı!")
        return

    # Gün bazlı seviye belirleme
    weekday = datetime.now().weekday()
    levels_map = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a2"}
    current_level = levels_map.get(weekday, "a1")

    # Seviye spesifikasyonları
    level_specs = {
        "a1": "Basit ve kısa cümleler. Tanışma, temel ihtiyaçlar, saat ve fiyat sorma gibi günlük dialoglar. Hedef: ~150-200 kelime.",
        "a2": "Geçmiş zaman (Perfekt) ve şimdiki zaman karışık. Günlük hayat, basit e-posta dili. Hedef: ~250-350 kelime.",
        "b1": "Resmi yazışmalar, vlog tadında anlatımlar. Yan cümleler, modal fiiller. Hedef: ~400-500 kelime.",
        "b2": "Akademik tartışmalar, Konjunktiv II, soyut kavramlar. Hedef: ~550-650 kelime.",
        "c1": "Çok katmanlı akademik analizler, felsefi perspektifler. Hedef: ~750-900 kelime."
    }

    # Geniş konu havuzu
    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau nach 1945",
        "Städte: Hamburgs Speicherstadt, Industriekultur im Ruhrgebiet, Die Schlösser in Potsdam",
        "Kultur: Oktoberfest Geschichte, Karneval im Rheinland, deutsche Feiertage, Die deutsche Brotkultur",
        "Traditionen: Weihnachtsmärkte, Schützenfeste, Brauchtum in den Alpen (Almabtrieb)",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Vereinsleben, Ehrenamt, Pfandsystem",
        "Wohnen: Mietverträge, Mieterrechte, Kehrwoche in Baden-Württemberg, Energie sparen",
        "Wissenschaft: Berühmte deutsche Erfinder (Gutenberg, Benz, Einstein), Max-Planck-Institut",
        "Weltraum: Das deutsche Zentrum für Luft- und Raumfahrt (DLR), Alexander Gerst und die ISS",
        "Technologie: Robotik, Künstliche Intelligenz in deutschen Firmen, Industrie 4.0",
        "Gesundheit: Das deutsche Gesundheitssystem, Hausarztmodell, Krankenversicherung",
        "Sport: Die Geschichte der Bundesliga, Wandersport, Breitensport und Fitness-Trends",
        "Geographie: Die Alpen, die Nord- ve Ostsee, Der Schwarzwald",
        "Umwelt: Erneuerbare Energien, Klimaschutzziele, Der deutsche Wald",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Rundfunkbeitrag",
        "Bildung: Das duale Ausbildungssystem, Studium an einer TU, Schulpflicht und Abitur",
        "Wirtschaft: Deutsche Automobilgeschichte (VW, BMW, Mercedes), Der Mittelstand",
        "Transport: Geschichte der Autobahn, Deutschlandticket, Fahrradstädte, Deutsche Bahn"
    ]

    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
Sen bir Goethe/Telc dil sınavı uzmanısın. {current_level.upper()} seviyesinde sınav formatına tam eşdeğer bir içerik üret.
SADECE JSON döndür, başka hiçbir açıklama yazma:
{{
  "id": "storie-ID",
  "youtubeId": "",
  "title": "Almanca Başlık",
  "summary": "NUR AUF DEUTSCH! (Max 2 Sätze)",
  "text": ["P1", "P2", "P3", "P4"],
  "image_prompts": [
    "realistic photo, cinematic lighting, high resolution, 8k",
    "realistic photo, cinematic lighting, high resolution, 8k",
    "realistic photo, cinematic lighting, high resolution, 8k",
    "realistic photo, cinematic lighting, high resolution, 8k"
  ],
  "vocab": [
    {{
      "term": "Almanca Kelime",
      "type": "Nomen/Verb/Adj",
      "meaning_tr": "Türkçe",
      "meaning_en": "English",
      "meaning_es": "Español",
      "meaning_ua": "Ukrainian",
      "example": "Almanca örnek cümle"
    }}
  ],
  "questions": [
    {{
      "question": "Soru metni",
      "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"],
      "answer": "Doğru Seçenek"
    }}
  ]
}}
(Konu: {selected_topics}, Seviye Detayı: {level_specs[current_level]})
"""

    # Failover Mantığı (Model ve Key döngüsü)
    for model_path in MODELS_TO_TRY:
        if current_key_index >= len(API_KEYS):
            break
            
        key = API_KEYS[current_key_index]
        try:
            print(f"🚀 Deneniyor: {model_path} | Key: {current_key_index + 1} | Seviye: {current_level.upper()}")
            response = call_gemini(prompt, key, model_path)

            if response.status_code == 200:
                res_json = response.json()
                raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                
                # JSON Ayıklama
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if not json_match:
                    continue
                
                data = json.loads(json_match.group(0).strip())

                # Klasör ve Dosya İşlemleri
                save_dir = os.path.join("src", "data", "stories", "de", current_level)
                file_name = get_next_filename(save_dir)
                file_path = os.path.join(save_dir, file_name)

                if os.path.exists(file_path):
                    return

                data["id"] = file_name.replace(".json", "")
                os.makedirs(save_dir, exist_ok=True)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"✅ BAŞARILI: {file_path}")
                return 

            elif response.status_code == 429:
                print(f"⚠️ 429 Kota Dolu ({model_path}). Key değiştiriliyor...")
                current_key_index += 1
                time.sleep(2)
                continue
            else:
                print(f"❌ API Hatası ({response.status_code}) — {model_path}")
                continue

        except Exception as e:
            print(f"⚠️ Hata: {str(e)[:50]}")
            continue

    print("🚨 TÜM DENEMELER BAŞARISIZ.")

if __name__ == "__main__":
    generate_story()