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

# API Key Havuzu
API_KEYS = []
for key_name in ["GEMINI_API_KEY_1", "GEMINI_API_KEY_2", "GEMINI_API_KEY"]:
    val = os.getenv(key_name)
    if val:
        clean_val = val.strip()
        if clean_val:
            API_KEYS.append(clean_val)

def get_available_models():
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if any(x in m.name for x in ['flash', 'pro']):
                    models.append(m.name)
        return sorted(models, key=lambda x: ("2.5" in x or "2.0" in x, "flash" in x), reverse=True)
    except Exception as e:
        return ["models/gemini-2.0-flash", "models/gemini-1.5-flash", "models/gemini-1.5-pro"]

def get_next_filename(directory):
    if not os.path.exists(directory): return "storie-001.json"
    files = [f for f in os.listdir(directory) if f.startswith("storie-") and f.endswith(".json")]
    numbers = {int(re.search(r"storie-(\d+)", f).group(1)) for f in files if re.search(r"storie-(\d+)", f)}
    next_number = 1
    while next_number in numbers: next_number += 1
    return f"storie-{next_number:03d}.json"

def generate_story():
    if not API_KEYS: return

    current_level = "a2" # Dinamik seviye ayarı
    
    level_config = {
        "a1": {"scenes": 5, "desc": "Temel ihtiyaçlar ve günlük rutin."},
        "a2": {"scenes": 8, "desc": "Geçmiş zaman ve sosyal etkileşimler."},
        "b1": {"scenes": 12, "desc": "Fikir belirtme ve karmaşık durumlar."},
        "b2": {"scenes": 15, "desc": "Argümantasyon ve profesyonel dil."},
        "c1": {"scenes": 20, "desc": "Akademik derinlik ve felsefi analiz."}
    }
    
    exam_logic = {
        "a1": "Kısa mesajlar, basit form doldurma ve temel alışveriş fiyatları.",
        "a2": "Hava durumu, istasyon anonsları, yol çalışmaları, restoran siparişleri ve doktor randevuları.",
        "b1": "İş hayatı, çevre, medya kullanımı, şikayet yönetimi ve resmi başvurular.",
        "b2": "Sürdürülebilirlik, globalleşme, teknolojik etik ve kariyer planlama.",
        "c1": "Sosyolojik analizler, tarihsel olayların bugüne etkisi, soyut kavramlar ve akademik terminoloji."
    }

    # --- DEVASA GENİŞLETİLMİŞ KONU HAVUZU ---
    topic_pool = [
        # Günlük Hayat & A2 Odaklı
        "Alltag: Ein Besuch beim Münchner Oktoberfest mit Budgetplanung",
        "Wetter: Ein plötzlicher Wintereinbruch in Bayern und die Folgen für die Bahn",
        "Verkehr: Baustellen auf der A99 und Umleitungen für Pendler",
        "Einkauf: Preise vergleichen zwischen Discounter und Biomarkt",
        "Gesundheit: Apotheken-Notdienst in der Nacht finden",
        "Wohnen: Eine Mülltrennung-Anleitung für neue Mieter im Haus",
        "Freizeit: Einen Wochenendausflug in die Allianz Arena planen",
        "Kommunikation: Eine wichtige Durchsage am Flughafen wegen Gate-Wechsel",
        
        # Eğitim & İş Dünyası (B1-B2)
        "Beruf: Vorbereitung auf ein Vorstellungsgespräch bei einem deutschen Mittelständler",
        "Bildung: Das Duale Studium - Praxis und Theorie kombinieren",
        "Bürokratie: Kindergeld beantragen und die nötigen Formulare verstehen",
        "Umwelt: Die Einführung der Solarpflicht für Neubauten in Deutschland",
        "Technik: Industrie 4.0 - Roboter in der Automobilproduktion",
        "Wirtschaft: Warum das Handwerk in Deutschland 'goldenen Boden' hat",
        "Digitalisierung: Bargeldlose Zahlung vs. deutsche Liebe zum Bargeld",
        "Marketing: Wie deutsche Firmen ihre Marken global schützen",
        
        # Kültür, Tarih & Üst Düzey (B2-C1)
        "Geschichte: 35 Jahre Deutsche Einheit - Erfolge und Herausforderungen",
        "Kultur: Die Rolle des Vereinslebens für die Integration in Deutschland",
        "Wissenschaft: Quantencomputing am Max-Planck-Institut",
        "Philosophie: Die Ethik von Künstlicher Intelligenz im deutschen Recht",
        "Architektur: Vom Bauhaus zum modernen Passivhaus-Standard",
        "Soziologie: Der demografische Wandel und seine Folgen für die Rente",
        "Literatur: Die Bedeutung der Frankfurter Buchmesse für die Weltliteratur",
        "Politik: Das föderale System in Deutschland einfach erklärt",
        "Umwelt: Energiewende - Können wir auf Atomkraft komplett verzichten?",
        "Psychologie: Work-Life-Balance in der deutschen Arbeitskultur"
    ]

    selected_topic = random.choice(topic_pool)
    config = level_config.get(current_level)
    
    prompt = f"""
Sen bir Goethe/Telc sınav uzmanısın. {current_level.upper()} seviyesinde bir sınav hazırlık materyali üret.
KRİTİK TALİMAT: Hikayeyi tam {config['scenes']} sahneye böl. Her sahne 2-3 kısa cümle olmalıdır.

HEDEF SINAV STRATEJİSİ:
- Seviye Mantığı: {exam_logic[current_level]}
- Metne mutlaka sınavda sorulabilecek kritik veriler (tarih, saat, ücret, yüzde, hava durumu derecesi, peron numarası) ekle.

MİKTAR KISITLAMALARI:
- VOCAB: Tam olarak 12-15 adet seviyeye uygun kilit kelime üret.
- QUESTIONS: Tam olarak 8-10 adet çoktan seçmeli sınav sorusu üret.

1. KONU: {selected_topic}
2. FORMAT: {config['desc']}
3. HASHTAGS: #LearnGerman, #GermanExam, #GoetheZertifikat, #DeutschLernen, #Germany ve konuya özel 15 hashtag.
4. GÖRSEL: Her sahne için 1 adet İngilizce "image_prompt" üret.

JSON YAPISI:
{{
  "id": "storie-ID",
  "youtubeId": "",
  "level": "{current_level}",
  "title": "Almanca Sınav Başlığı",
  "summary": "Bu bölümde {current_level} sınavında çıkabilecek yapıları öğreneceksiniz.",
  "hashtags": ["#Hashtag1", "..."],
  "text": ["Sahne 1", "..."],
  "image_prompts": ["Prompt 1", "..."],
  "vocab": [{{ "term": "De", "type": "Nomen", "meaning_tr": "TR", "meaning_en": "EN", "meaning_es": "ES", "meaning_uk": "UK", "example": "Bsp" }}],
  "questions": [{{ "question": "Q", "options": ["A", "B", "C", "D"], "answer": "X" }}]
}}
DİL: SADECE JSON.
"""

    for i, api_key in enumerate(API_KEYS):
        genai.configure(api_key=api_key)
        MODELS_TO_TRY = get_available_models()
        for model_name in MODELS_TO_TRY:
            try:
                print(f"🔄 Deneniyor: {model_name} | Key {i+1}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                json_str = response.text.strip()
                if "```json" in json_str: json_str = json_str.split("```json")[1].split("```")[0].strip()
                elif "```" in json_str: json_str = json_str.split("```")[1].split("```")[0].strip()
                
                data = json.loads(json_str)
                save_dir = os.path.join("src", "data", "stories", "de", current_level)
                os.makedirs(save_dir, exist_ok=True)
                file_name = get_next_filename(save_dir)
                file_path = os.path.join(save_dir, file_name)
                
                data["id"] = file_name.replace(".json", "")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"✅ BAŞARILI: {file_path} | {len(data['questions'])} Soru | {len(data['vocab'])} Kelime")
                return 

            except Exception as e:
                print(f"⚠️ Hata: {str(e)[:50]}...")
                continue

if __name__ == "__main__":
    generate_story()