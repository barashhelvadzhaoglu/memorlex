import google.generativeai as genai
import json
import os
from datetime import datetime
import random
import re
import requests
import time

# 1. API Yapılandırması ve Key Havuzu
API_KEYS = [os.getenv("GEMINI_API_KEY_1"), os.getenv("GEMINI_API_KEY_2")]
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0

# 2. Denenecek model listesi
MODELS_TO_TRY = [
    "gemini-2.0-flash-exp", 
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
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

def generate_story():
    global current_key_index
    weekday = datetime.now().weekday()
    levels_map = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a2"}
    current_level = levels_map.get(weekday, "a1")

    level_specs = {
        "a1": "Basit ve kısa cümleler. Tanışma, temel ihtiyaçlar, saat ve fiyat sorma gibi hayati günlük dialoglar. Kelime haznesi sınırlı (A1 seviye sertifika kelimeleri). Şimdiki zaman ağırlıklı, somut rakamlar (saat, fiyat, peron) doğrudan ve net bir şekilde sorulur. Karmaşık bağlaçlardan kaçınılır. Hedef: ~150-200 kelime.",
        "a2": "Geçmiş zaman (Perfekt) ve şimdiki zaman karışık. Günlük hayat anonsları, basit e-posta/mektup dili, temel bağlaçlar (und, aber, weil, dann). Karmaşık olmayan betimlemeler ve kişisel deneyimlerin aktarımı. Rakamlar ve kilit veriler metin içinde hafif dağınık verilir, doğrudan okuma/anlama becerisi test edilir. Hedef: ~250-350 kelime.",
        "b1": "Resmi yazışmalar, radyo programı veya vlog tadında anlatımlar, fikir beyan etme (Meinung äußern). Yan cümleler (Nebensätze: dass, obwohl, wenn), pasif yapı başlangıcı ve modal fiillerin yoğun kullanımı. Sosyal konular, iş yaşamı ve eğitim üzerine odaklanır. Sınav formatına uygun olarak 'tuzak' bilgiler sorgulanır. Hedef: ~400-500 kelime.",
        "b2": "Akademik ve profesyonel tartışmalar, detaylı gazete makaleleri, varsayımsal durumlar (Konjunktiv II) ve gelecek zaman. Soyut kavramlar üzerine analizler, hipotez kurma ve sebep-sonuç ilişkilerinin derinleştirilmesi. Hedef: ~550-650 kelime.",
        "c1": "Çok katmanlı akademik analizler, toplumsal değişimlerin derinlemesine incelenmesi, tarihsel ve felsefi perspektifler. Üst düzey retorik araçlar ve nominal stil. Hedef: ~750-900 kelime."
    }

    topic_pool = [
        "Geschichte: Die Berliner Mauer, der Kölner Dom, Münchens Wiederaufbau nach 1945, Das Römische Reich am Rhein",
        "Städte: Hamburgs Speicherstadt, Industkultur im Ruhrgebiet, Die Schlösser in Potsdam",
        "Kultur: Oktoberfest Geschichte, Karneval im Rheinland, deutsche Feiertage, Die deutsche Brotkultur",
        "Traditionen: Weihnachtsmärkte, Schützenfeste, Brauchtum in den Alpen (Almabtrieb)",
        "Alltag: Mülltrennung-Kultur, Sonntagsruhe, Vereinsleben, Ehrenamt, Pfandsystem in Deutschland",
        "Wohnen: Mietverträge, Mieterrechte, Kehrwoche in Baden-Württemberg, Energie sparen im Haushalt",
        "Wissenschaft: Berühmte deutsche Erfinder (Gutenberg, Benz, Einstein), Max-Planck-Institut",
        "Weltraum: Das deutsche Zentrum für Luft- und Raumfahrt (DLR), Alexander Gerst und die ISS",
        "Technologie: Die Zukunft der Robotik, Künstliche Intelligenz in deutschen Firmen, Industrie 4.0",
        "Gesundheit: Das deutsche Gesundheitssystem, Hausarztmodell, Krankenversicherung (TK/AOK)",
        "Sport: Die Geschichte der Bundesliga, Wandersport in Deutschland, Breitensport und Fitness-Trends",
        "Geographie: Die Alpen, die Nord- und Ostsee, Der Schwarzwald, Unterschiede zwischen Ost- und Westdeutschland",
        "Umwelt: Erneuerbare Energien, Klimaschutzziele in Deutschland, Der deutsche Wald",
        "Bürokratie: Anmeldung beim KVR, Elterngeld, Kindergeld, Rundfunkbeitrag, Steuererklärung",
        "Bildung: Das duale Ausbildungssystem, Studium an einer TU, Schulpflicht und Abitur",
        "Wirtschaft: Deutsche Automobilgeschichte (VW, BMW, Mercedes), Der Mittelstand als Rückgrat",
        "Transport: Geschichte der Autobahn, Deutschlandticket, Fahrradstädte wie Münster, Deutsche Bahn"
    ]

    selected_topics = random.sample(topic_pool, 2)

    prompt = f"""
    Sen bir Goethe/Telc dil sınavı uzmanısın. {current_level.upper()} seviyesinde sınav formatına tam eşdeğer bir içerik üret.

    KRİTİK TALİMATLAR:
    1. KONU: {selected_topics} konularını birbiriyle harmanla.
    2. PERSPEKTİF: Hikayeyi her seferinde farklı bir bireyin gözünden anlat.
    3. SINAV FORMATI (TUZAK BİLGİLER): Metin içine mutlaka kilit veriler ekle: Saatler, Fiyatlar, Tarihler, Peron ve Kapı Numaraları.
    4. SORULAR: 8-10 soru hazırla. Yarısı kilit verileri (saat, tarih, fiyat vb.) sorgulamalı.
    5. YOUTUBE: Akıcı, doğal bir vlog seslendirme dili.
    6. SEVİYE KRİTERİ: {level_specs[current_level]}
    7. IMAGE PROMPTS: Her paragraf için İngilizce, Stable Diffusion uyumlu görsel açıklaması yaz.

    SADECE JSON döndür, başka hiçbir şey yazma:
    {{
      "id": "storie-ID",
      "youtubeId": "",
      "title": "Almanca Başlık",
      "summary": "NUR AUF DEUTSCH! (Max. 2 Sätze)",
      "text": ["Paragraf 1", "Paragraf 2", "Paragraf 3", "Paragraf 4"],
      "image_prompts": [
        "realistic photo, [paragraf 1 sahnesi], cinematic lighting, high quality",
        "realistic photo, [paragraf 2 sahnesi], cinematic lighting, high quality",
        "realistic photo, [paragraf 3 sahnesi], cinematic lighting, high quality",
        "realistic photo, [paragraf 4 sahnesi], cinematic lighting, high quality"
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
    """

    # --- Üretim Döngüsü (Örnekteki Failover Mantığı) ---
    for model_name in MODELS_TO_TRY:
        key = API_KEYS[current_key_index]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
        
        try:
            print(f"🚀 Deneniyor: {model_name} | Key: {current_key_index + 1} | Seviye: {current_level}")
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            response = requests.post(url, json=payload, timeout=90)
            
            if response.status_code == 200:
                res_json = response.json()
                raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                
                # Markdown temizleme
                content = raw_text.replace("```json", "").replace("```", "").strip()
                data = json.loads(content)

                save_dir = os.path.join("src", "data", "stories", "de", current_level)
                file_name = get_next_filename(save_dir)
                file_path = os.path.join(save_dir, file_name)

                if os.path.exists(file_path):
                    print(f"⏩ Dosya mevcut: {file_path}")
                    return

                data["id"] = file_name.replace(".json", "")
                os.makedirs(save_dir, exist_ok=True)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                print(f"✅ BAŞARILI: {file_path} ({model_name})")
                return 

            elif response.status_code == 429:
                print(f"⚠️ {model_name} Kota Dolu (429). Sonraki modele/key'e geçiliyor...")
                # Kota dolduğunda hem key değiştirip hem döngüye devam edelim
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                continue
                
            else:
                print(f"❌ API Hatası ({response.status_code}): {model_name}")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                continue

        except Exception as e:
            print(f"❌ Hata: {str(e)[:100]}")
            current_key_index = (current_key_index + 1) % len(API_KEYS)
            continue

    print("🚨 KRİTİK: Hiçbir kombinasyon çalışmadı.")

if __name__ == "__main__":
    generate_story()