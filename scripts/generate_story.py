import google.generativeai as genai
import json
import os
from datetime import datetime
import random
import re
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# API Key Havuzu - .env üzerinden yüklenir
API_KEYS = []
for key_name in ["GEMINI_API_KEY_1", "GEMINI_API_KEY_2", "GEMINI_API_KEY"]:
    val = os.getenv(key_name)
    if val:
        API_KEYS.append(val)

def get_available_models():
    """Google API üzerinden kullanılabilir güncel Flash ve Pro modellerini çeker."""
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if any(x in m.name for x in ['flash', 'pro']):
                    models.append(m.name)
        # 2.0 ve 2.5 modellerini ve flash modellerini başa alacak şekilde sırala
        return sorted(models, key=lambda x: ("2.5" in x or "2.0" in x, "flash" in x), reverse=True)
    except Exception as e:
        print(f"⚠️ Model listesi alınamadı, fallback listesi kullanılacak: {e}")
        return ["models/gemini-2.0-flash", "models/gemini-1.5-flash", "models/gemini-1.5-pro"]

def get_next_filename(directory):
    """storie-001.json varsa atla, bir sonraki boş numarayı bul."""
    if not os.path.exists(directory):
        return "storie-001.json"
    files = [f for f in os.listdir(directory) if f.startswith("storie-") and f.endswith(".json")]
    numbers = set()
    for f in files:
        m = re.search(r"storie-(\d+)", f)
        if m:
            numbers.add(int(m.group(1)))
    next_number = 1
    while next_number in numbers:
        next_number += 1
    padding = max(3, len(str(next_number)))
    return f"storie-{next_number:0{padding}d}.json"

def generate_story():
    if not API_KEYS:
        print("❌ HATA: Hiçbir API anahtarı bulunamadı!")
        return

    # Şimdilik C1 odaklı, ancak seviye yapılandırması tam eklendi
    current_level = "c1" 
    
    # Seviyeye göre görsel (sahne) sayısı ve metin derinliği ayarları
    level_config = {
        "a1": {"scenes": 5, "desc": "Basit cümleler, temel rutinler."},
        "a2": {"scenes": 7, "desc": "Temel ihtiyaçlar, geçmiş zaman."},
        "b1": {"scenes": 10, "desc": "Kişisel görüşler ve hayaller."},
        "b2": {"scenes": 12, "desc": "Soyut konular ve teknik tartışmalar."},
        "c1": {"scenes": 15, "desc": "Akademik analiz, retorik araçlar ve nominal stil."}
    }
    
    config = level_config.get(current_level)
    print(f"🎯 MOD: {current_level.upper()} Seviyesi | Hedef: {config['scenes']} Sahne ve Görsel Prompt")

    level_specs = {
        "c1": "Çok katmanlı akademik analizler, toplumsal değişimlerin derinlemesine incelenmesi, tarihsel ve felsefi perspektifler. İnce anlam farkları (Nuancen), üst düzey retorik araçlar ve nominal stil (Nominalstil) kullanımı. Metinler arası referanslar ve yüksek düzeyde deyimsel ifadeler. Hedef: Sahne başına 3-4 cümle."
    }

    # Eksiksiz Konu Havuzu (Hiçbir satır silinmedi)
    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau nach 1945, Das Römische Reich am Rhein",
        "Städte: Hamburgs Speicherstadt, Industkultur im Ruhrgebiet, Die Schlösser in Potsdam",
        "Kultur: Oktoberfest Geschichte, Karneval im Rheinland, deutsche Feiertage, Die deutsche Brotkultur",
        "Traditionen: Weihnachtsmärkte, Schützenfeste, Brauchtum in den Alpen (Almabtrieb)",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Vereinsleben, Ehrenamt, Pfandsystem in Deutschland",
        "Wohnen: Mietverträge, Mieterrechte, Kehrwoche in Baden-Württemberg, Energie sparen im Haushalt",
        "Wissenschaft: Berühmte deutsche Erfinder (Gutenberg, Benz, Einstein), Max-Planck-Institut",
        "Weltraum: Das deutsche Zentrum für Luft- und Raumfahrt (DLR), Alexander Gerst und die ISS",
        "Physik & Chemie: Die Entdeckung der Röntgenstrahlen, Quantenphysik für Anfänger, Chemie im Alltag",
        "Technologie: Die Zukunft der Robotik, Künstliche Intelligenz in deutschen Firmen, Industrie 4.0",
        "Gesundheit: Das deutsche Gesundheitssystem, Hausarztmodell, Krankenversicherung (TK/AOK), Heilpraktiker",
        "Sport: Die Geschichte der Bundesliga, Wandersport in Deutschland, Breitensport und Fitness-Trends",
        "Olympia: Legendäre deutsche Athleten, Die Olympischen Spiele 1972 in München",
        "Geographie: Die Alpen, die Nord- und Ostsee, Der Schwarzwald, Unterschiede zwischen Ost- und Westdeutschland",
        "Umwelt: Erneuerbare Energies, Klimaschutzziele in Deutschland, Der deutsche Wald und seine Bedeutung",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Rundfunkbeitrag (GEZ), Steuererklärung",
        "Bildung: Das duale Ausbildungssystem, Studium an einer TU, Schulpflicht und Abitur",
        "Kinder: Kita-Alltag in Bayern, Märchen der Gebrüder Grimm, Kinderrechte in Deutschland",
        "Wirtschaft: Deutsche Automobilgeschichte (VW, BMW, Mercedes), Der Mittelstand als Rückgrat",
        "Transport: Geschichte der Autobahn, Deutschlandticket, Fahrradstädte wie Münster, Deutsche Bahn Herausforderungen"
    ]

    selected_topics = random.sample(topic_pool, 2)
    
    prompt = f"""
Sen bir Goethe/Telc dil sınavı uzmanısın. {current_level.upper()} seviyesinde tam eşdeğer bir içerik üret.
KRİTİK TALİMAT: Hikayeyi tam {config['scenes']} sahneye böl. Her sahne (text dizisindeki her bir eleman) en fazla 3-4 cümle olmalıdır.

1. KONU: {selected_topics}
2. FORMAT: {config['desc']}
3. VERİ: Metne kilit veriler, yüzdeler ve tarihsel kronoloji ekle.
4. GÖRSEL: Her bir sahne metni için, o metni betimleyen tam 1 adet İngilizce "image_prompt" üret. (Realistic, cinematic, high quality).
5. DİL: SADECE JSON döndür. Vocab kısmında Ukraynaca için "meaning_uk" anahtarını kullan.

JSON YAPISI:
{{
  "id": "storie-ID",
  "youtubeId": "",
  "title": "Almanca Başlık",
  "summary": "Almanca Özet (Max. 2 cümle)",
  "text": ["Sahne 1 (3-4 cümle)", "Sahne 2 (3-4 cümle)", "... Sahne {config['scenes']} (3-4 cümle)"],
  "image_prompts": ["Prompt 1", "Prompt 2", "... Prompt {config['scenes']}"],
  "vocab": [
    {{ 
      "term": "Almanca Kelime", "type": "Nomen/Verb/Adj", 
      "meaning_tr": "TR", "meaning_en": "EN", "meaning_es": "ES", "meaning_uk": "UK",
      "example": "Almanca örnek cümle" 
    }}
  ],
  "questions": [
    {{ "question": "Soru (Almanca)", "options": ["A", "B", "C", "D"], "answer": "Doğru Şık" }}
  ]
}}
Seviye Kriteri: {level_specs[current_level]}
"""

    for api_key in API_KEYS:
        genai.configure(api_key=api_key)
        MODELS_TO_TRY = get_available_models()
        for model_name in MODELS_TO_TRY:
            try:
                print(f"🔄 Deneniyor: {model_name} | Key: {api_key[:8]}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                json_str = response.text.strip()
                if "```json" in json_str:
                    json_str = json_str.split("```json")[1].split("```")[0].strip()
                elif "```" in json_str:
                    json_str = json_str.split("```")[1].split("```")[0].strip()
                
                data = json.loads(json_str)
                save_dir = os.path.join("src", "data", "stories", "de", current_level)
                os.makedirs(save_dir, exist_ok=True)
                file_name = get_next_filename(save_dir)
                file_path = os.path.join(save_dir, file_name)
                
                data["id"] = file_name.replace(".json", "")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"✅ BAŞARILI: {file_path} | {len(data['text'])} sahne üretildi.")
                return 

            except Exception as e:
                print(f"⚠️ Hata ({model_name}): {str(e)[:100]}")
                continue

    print("🚨 TÜM DENEMELER BAŞARISIZ.")

if __name__ == "__main__":
    generate_story()