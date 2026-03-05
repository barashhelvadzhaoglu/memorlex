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
        clean_val = val.strip()
        if clean_val:
            API_KEYS.append(clean_val)

def get_available_models():
    """Google API üzerinden kullanılabilir güncel Flash ve Pro modellerini çeker."""
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if any(x in m.name for x in ['flash', 'pro']):
                    models.append(m.name)
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
        print("❌ HATA: Hiçbir API anahtarı bulunamadı! Secrets yapılandırmasını kontrol edin.")
        return

    # --- KONFİGÜRASYON ---
    current_level = "c1" # Manuel veya bir döngüden gelebilir
    
    level_config = {
        "a1": {"scenes": 5, "desc": "Temel selamlaşma ve günlük basit diyaloglar."},
        "a2": {"scenes": 8, "desc": "Geçmiş zaman (Perfekt) ve basit resmi konuşmalar."},
        "b1": {"scenes": 12, "desc": "Bağlaçlar (weil, obwohl) ve detaylı anlatımlar."},
        "b2": {"scenes": 15, "desc": "Pasif yapı ve karmaşık yan cümleler."},
        "c1": {"scenes": 20, "desc": "Akademik analiz, retorik araçlar ve nominal stil."}
    }
    
    # --- SINAV MANTIĞI MODÜLÜ ---
    exam_logic = {
        "a1": "Temel saatler, aile tanıtımı, basit alışveriş fiyatları ve 'Hören Teil 1' tarzı kısa diyaloglar.",
        "a2": "Hava durumu raporları, tren istasyonu anonsları (gecikme/peron değişimi), müze/sinema bilet fiyatları ve yoldaki çalışma uyarıları.",
        "b1": "Müşteri şikayetleri, çevre kirliliği üzerine fikir belirtme, iş yerindeki diyaloglar ve resmi kurum (Amt) yazışmaları.",
        "b2": "Medya eleştirileri, iş toplantıları, toplumsal sorunların avantaj/dezavantaj analizi ve teknik ürün açıklamaları.",
        "c1": "Bilimsel makaleler, felsefi çıkarımlar, sosyolojik analizler ve üst düzey bürokratik dil kullanımı."
    }

    # --- GENİŞLETİLMİŞ SINAV KONU HAVUZU ---
    topic_pool = [
        "Wetter & Klima: Ein extremer Wetterumschwung in den Alpen",
        "Verkehr: Baustellen auf der A9 und Zugausfälle wegen Gleisarbeiten",
        "Finanzen: Die Kosten für ein Studium in München vs. Berlin",
        "Gesundheit: Die Digitalisierung in deutschen Krankenhäusern",
        "Bürokratie: Eine komplizierte Anmeldung beim KVR",
        "Wohnen: Die Nebenkostenabrechnung und das Energiesparen",
        "Geschichte: Der Einfluss des Bauhauses auf die moderne Architektur",
        "Arbeit: Das duale Ausbildungssystem in der Automobilindustrie",
        "Kultur: Die Bedeutung der Vereinsmeierei in Kleinstädten",
        "Technik: Künstliche Intelligenz in der deutschen mittelständischen Industrie"
    ]

    selected_topics = random.sample(topic_pool, 1)
    config = level_config.get(current_level)
    
    # --- SINAV ODAKLI PROMPT ---
    prompt = f"""
Sen bir Goethe/Telc sınav uzmanısın. {current_level.upper()} seviyesinde bir sınav hazırlık materyali üret.
KRİTİK TALİMAT: Hikayeyi tam {config['scenes']} sahneye böl. Her sahne 2-3 kısa cümle olmalıdır.

HEDEF SINAV STRATEJİSİ:
- Seviye Mantığı: {exam_logic[current_level]}
- Metne mutlaka sınavda sorulabilecek kritik veriler (tarih, saat, ücret, yüzde, hava durumu derecesi) ekle.
- Karakterler arasında gerçek sınav diyalogları veya duyuru formatı kullan.

1. KONU: {selected_topics}
2. FORMAT: {config['desc']}
3. HASHTAGS: #LearnGerman, #GermanExam, #GoetheZertifikat, #DeutschLernen, #Germany, #GermanVocabulary ve konuya özel 10 adet popüler hashtag.
4. GÖRSEL: Her sahne için 1 adet İngilizce "image_prompt" üret.

JSON YAPISI:
{{
  "id": "storie-ID",
  "youtubeId": "",
  "level": "{current_level}",
  "title": "Almanca Sınav Başlığı",
  "summary": "Bu bölümde {current_level} sınavında çıkabilecek kilit yapıları öğreneceksiniz.",
  "hashtags": ["#Hashtag1", "..."],
  "text": ["Sahne 1", "Sahne 2", "... Sahne {config['scenes']}"],
  "image_prompts": ["Prompt 1", "..."],
  "vocab": [
    {{ "term": "Almanca", "type": "Nomen", "meaning_tr": "TR", "meaning_en": "EN", "meaning_es": "ES", "meaning_uk": "UK", "example": "Örnek cümle" }}
  ],
  "questions": [
    {{ "question": "Sınav Sorusu (Almanca)", "options": ["A", "B", "C", "D"], "answer": "Doğru Şık" }}
  ]
}}
DİL: SADECE JSON döndür.
"""

    # --- API DÖNGÜSÜ ---
    for i, api_key in enumerate(API_KEYS):
        genai.configure(api_key=api_key)
        MODELS_TO_TRY = get_available_models()
        for model_name in MODELS_TO_TRY:
            try:
                print(f"🔄 Deneniyor: {model_name} | Key {i+1}")
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
                
                print(f"✅ BAŞARILI: {file_path} | {len(data['text'])} sahne, sınav soruları ve hashtagler üretildi.")
                return 

            except Exception as e:
                print(f"⚠️ Hata ({model_name}): {str(e)[:50]}...")
                continue

    print("🚨 TÜM DENEMELER BAŞARISIZ.")

if __name__ == "__main__":
    generate_story()