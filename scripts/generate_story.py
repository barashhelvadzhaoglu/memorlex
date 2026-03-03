import json
import os
from datetime import datetime
import random
import re
import requests
import time
from dotenv import load_dotenv

load_dotenv()

# API Key Havuzu - sırayla dener
API_KEYS = [os.getenv("GEMINI_API_KEY_1"), os.getenv("GEMINI_API_KEY_2"), os.getenv("GEMINI_API_KEY")]
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0

# Güncel model listesi (Çalışan örneğe göre düzenlendi)
MODELS_TO_TRY = [
    "models/gemini-2.5-flash", 
    "models/gemini-3-flash",
    "models/gemini-2.5-flash-lite",
    "models/gemini-1.5-flash",
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

def call_gemini(prompt, api_key, model_name):
    """Direkt REST API ile Gemini çağrısı yapar."""
    url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "maxOutputTokens": 4096,
        }
    }
    response = requests.post(url, json=payload, timeout=90)
    # Hata kodlarını üst fonksiyonda kontrol etmek için raise_for_status() yerine response döndürüyoruz
    return response

def generate_story():
    global current_key_index
    if not API_KEYS:
        print("❌ HATA: API key bulunamadı! .env veya GitHub Secrets kontrol et.")
        return

    weekday = datetime.now().weekday()
    levels_map = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a2"}
    current_level = levels_map.get(weekday, "a1")

    level_specs = {
        "a1": "Basit ve kısa cümleler. Tanışma, temel ihtiyaçlar, saat ve fiyat sorma gibi günlük dialoglar. Şimdiki zaman ağırlıklı, somut rakamlar doğrudan sorulur. Hedef: ~150-200 kelime.",
        "a2": "Geçmiş zaman (Perfekt) ve şimdiki zaman karışık. Günlük hayat, basit e-posta/mektup dili, temel bağlaçlar. Hedef: ~250-350 kelime.",
        "b1": "Resmi yazışmalar, vlog tadında anlatımlar. Yan cümleler, modal fiiller. Tuzak bilgiler sorgulanır. Hedef: ~400-500 kelime.",
        "b2": "Akademik tartışmalar, Konjunktiv II, soyut kavramlar, hipotez kurma. Hedef: ~550-650 kelime.",
        "c1": "Çok katmanlı akademik analizler, felsefi perspektifler, nominal stil. Hedef: ~750-900 kelime."
    }

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
        "Geographie: Die Alpen, die Nord- und Ostsee, Der Schwarzwald",
        "Umwelt: Erneuerbare Energies, Klimaschutzziele, Der deutsche Wald",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Rundfunkbeitrag",
        "Bildung: Das duale Ausbildungssystem, Studium an einer TU, Schulpflicht und Abitur",
        "Wirtschaft: Deutsche Automobilgeschichte (VW, BMW, Mercedes), Der Mittelstand",
        "Transport: Geschichte der Autobahn, Deutschlandticket, Fahrradstädte, Deutsche Bahn"
    ]

    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
Sen bir Goethe/Telc dil sınavı uzmanısın. {current_level.upper()} seviyesinde sınav formatına tam eşdeğer bir içerik üret.

KRİTİK TALİMATLAR:
1. KONU: {selected_topics} konularını birbiriyle harmanla.
2. PERSPEKTİF: Hikayeyi her seferinde farklı bir bireyin gözünden anlat.
3. SINAV FORMATI: Metin içine mutlaka kilit veriler ekle: Saatler, Fiyatlar, Tarihler, Peron/Kapı Numaraları.
4. SORULAR: 8-10 soru hazırla. Yarısı kilit verileri (saat, tarih, fiyat) sorgulamalı.
5. YOUTUBE: Akıcı, doğal bir vlog seslendirme dili.
6. SEVİYE KRİTERİ: {level_specs[current_level]}
7. IMAGE PROMPTS: Her paragraf için İngilizce, Stable Diffusion uyumlu görsel açıklaması yaz.
   - Format: "realistic photo, [sahne detayı], [mekan], [atmosfer], cinematic lighting, high quality"
   - Paragrafa %100 uygun, spesifik detaylar içermeli.

SADECE JSON döndür, başka hiçbir şey yazma:
{{
  "id": "storie-ID",
  "youtubeId": "",
  "title": "Almanca Başlık",
  "summary": "NUR AUF DEUTSCH! (Max. 2 Sätze)",
  "text": ["Paragraf 1", "Paragraf 2", "Paragraf 3", "Paragraf 4"],
  "image_prompts": [
    "realistic photo, ..., cinematic lighting, high quality",
    "realistic photo, ..., cinematic lighting, high quality",
    "realistic photo, ..., cinematic lighting, high quality",
    "realistic photo, ..., cinematic lighting, high quality"
  ],
  "vocab": [
    {{
      "term": "Almanca Kelime",
      "type": "Nomen/Verb/Adj/Phrase",
      "meaning_tr": "TR", "meaning_en": "EN", "meaning_es": "ES", "meaning_ua": "UA",
      "example": "Almanca örnek cümle"
    }}
  ],
  "questions": [
    {{ "question": "Soru (Almanca)", "options": ["A", "B", "C", "D"], "answer": "Doğru Şık" }}
  ]
}}
(Vocab: 15-20 adet. text: tam 4 paragraf. image_prompts: text ile aynı uzunlukta.)
"""

    # Tüm key + model kombinasyonlarını sırayla dene (Failover Mantığı)
    for model_name in MODELS_TO_TRY:
        key = API_KEYS[current_key_index]
        try:
            print(f"🚀 Deneniyor: {model_name} | Key: {current_key_index + 1} | Seviye: {current_level.upper()}")
            response = call_gemini(prompt, key, model_name)

            if response.status_code == 200:
                res_json = response.json()
                raw_text = res_json['candidates'][0]['content']['parts'][0]['text']

                # JSON temizle
                content = raw_text.replace("```json", "").replace("```", "").strip()
                data = json.loads(content)

                # Dosya kaydet
                save_dir = os.path.join("src", "data", "stories", "de", current_level)
                file_name = get_next_filename(save_dir)
                file_path = os.path.join(save_dir, file_name)

                if os.path.exists(file_path):
                    print(f"⚠️ Dosya zaten mevcut, atlanıyor: {file_path}")
                    return

                data["id"] = file_name.replace(".json", "")
                os.makedirs(save_dir, exist_ok=True)

                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                print(f"✅ BAŞARILI: {file_path} ({model_name})")
                return  # Başarılı, çık

            elif response.status_code == 429:
                print(f"⚠️ Kota dolu (429) — {model_name}. Sonraki model deneniyor...")
                continue
            else:
                print(f"❌ API Hatası ({response.status_code}) — {model_name}. Key değiştiriliyor...")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                time.sleep(1)
                continue

        except (json.JSONDecodeError, KeyError) as e:
            print(f"⚠️ JSON parse hatası ({model_name}): {str(e)[:80]}")
            continue

        except Exception as e:
            print(f"⚠️ Beklenmedik hata ({model_name}): {str(e)[:100]}")
            continue

    print("🚨 TÜM KEY VE MODELLER DENENDİ, SONUÇ ALINAMADI.")

if __name__ == "__main__":
    generate_story()