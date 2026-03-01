import os
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasındaki verileri (GEMINI_API_KEY_1 vb.) sisteme yükler
load_dotenv()

# 1. API Yapılandırması (Environment Variables'dan çekiliyor)
# Network Security Notu: Anahtarlar artık kodda değil, .env dosyasında gizli.
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2")
]
# Boş olanları (None) temizle
API_KEYS = [key for key in API_KEYS if key]

current_key_index = 0

TOPICS = [
    ("time-dates", "Zeit & Datum"), ("weather", "Wetter & Jahreszeiten"),
    ("hobbies", "Hobbys & Freizeit"), ("transport", "Verkehr & Transport"),
    ("travel", "Reisen & Urlaub"), ("clothing", "Kleidung & Mode"),
    ("daily-routine", "Tagesablauf"), ("city-life", "Stadt & Land"),
    ("restaurant", "Im Restaurant"), ("hotel", "Im Hotel"),
    ("post-bank", "Post & Bank"), ("emergency", "Notfälle & Hilfe"),
    ("work-office", "Arbeit & Büro"), ("job-search", "Jobsuche & Bewerbung"),
    ("education", "Schule & Universität"), ("technology", "Technologie & IT"),
    ("internet-media", "Internet & Soziale Medien"), ("communication", "Kommunikation & Telefonate"),
    ("marketing-sales", "Marketing & Verkauf"), ("finance-economy", "Finanzen & Wirtschaft"),
    ("environment", "Umwelt & Natur"), ("climate-change", "Klimawandel"),
    ("culture-traditions", "Kultur & Traditionen"), ("politics", "Politik & Staat"),
    ("law-justice", "Recht & Justiz"), ("history", "Geschichte"),
    ("art-literature", "Kunst & Literature"), ("music-cinema", "Musik & Kino"),
    ("psychology", "Psychologie & Gefühle"), ("philosophy", "Philosophie & Werte"),
    ("religion-spirituality", "Religion & Spiritualität"), ("science-research", "Wissenschaft & Forschung"),
    ("society-problems", "Gesellschaftliche Probleme"), ("globalization", "Globalisierung"),
    ("migration-integration", "Migration & Integration"), ("ethics-ai", "Ethik & KI"),
    ("future-trends", "Zukunftstrends"), ("media-criticism", "Medienkritik"),
    ("astronomy-space", "Astronomie & Weltraum"), ("architecture", "Architektur"),
    ("sports-nutrition", "Leistungssport & Ernährung"), ("tourism-impact", "Massentourismus & Folgen")
]

def get_latest_flash_model(api_key):
    """Kullanılabilir en güncel modeli bulur."""
    for ver in ["v1", "v1beta"]:
        url = f"https://generativelanguage.googleapis.com/{ver}/models?key={api_key}"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                models = response.json().get('models', [])
                flash_models = [m['name'] for m in models if 'flash' in m['name'].lower()]
                if flash_models:
                    return sorted(flash_models, reverse=True)[0]
        except: continue
    return "models/gemini-1.5-flash"

def is_file_valid(file_path):
    """Dosyayı açar ve TR, EN, UK, ES dillerinin varlığını kontrol eder."""
    if not file_path.exists():
        return False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, list) or len(data) == 0:
                return False
            
            required_keys = ['meaning_tr', 'meaning_en', 'meaning_uk', 'meaning_es', 'example']
            for item in data[:3]:
                if not all(key in item for key in required_keys):
                    return False
            return True
    except:
        return False

def generate_unit(lang, topic_key, topic_name, level):
    global current_key_index
    
    base_dir = Path(__file__).parent.parent 
    save_path = base_dir / "src" / "data" / "vocabulary" / lang / level.lower() / "topic"
    save_path.mkdir(parents=True, exist_ok=True)
    file_path = save_path / f"{topic_key}.json"

    if is_file_valid(file_path):
        print(f"⏩ Atlanıyor: {topic_key} ({level})")
        return

    word_count = {"a1": 15, "a2": 25, "b1": 35, "b2": 45, "c1": 60}.get(level.lower(), 30)
    success = False
    
    while not success:
        if not API_KEYS:
            print("❌ HATA: API_KEYS listesi boş! .env dosyasını kontrol et.")
            return

        key = API_KEYS[current_key_index]
        model_name = get_latest_flash_model(key)
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={key}"
        
        prompt_text = f"""
        Act as a professional German teacher. Create a vocabulary JSON for '{topic_name}' at {level.upper()} level.
        Requirements:
        1. Include exactly {word_count} unique items.
        2. 'term' field MUST include articles for nouns (der/die/das).
        3. Provide meanings in 4 languages: 'meaning_tr' (Turkish), 'meaning_en' (English), 'meaning_uk' (Ukrainian), 'meaning_es' (Spanish).
        Return ONLY a raw JSON array.
        """

        try:
            response = requests.post(url, json={"contents": [{"parts": [{"text": prompt_text}]}]}, timeout=60)
            if response.status_code == 200:
                res_json = response.json()
                raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                clean_json = raw_text.replace("```json", "").replace("```", "").strip()
                data = json.loads(clean_json)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"✅ BAŞARIYLA GÜNCELLENDİ: {topic_key} ({level})")
                success = True
            elif response.status_code == 429:
                print(f"⚠️ Kota Doldu. Anahtar değiştiriliyor...")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                time.sleep(15)
            else:
                print(f"❌ API Hatası ({response.status_code})...")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                time.sleep(5)
        except Exception as e:
            print(f"❌ Hata: {str(e)[:50]}")
            time.sleep(10)

if __name__ == "__main__":
    print(f"🏁 Operasyon Başladı... (Münih - Deutschlandticket Modu)")
    for t_key, t_name in TOPICS:
        for lvl in ["a1", "a2", "b1", "b2", "c1"]:
            generate_unit("de", t_key, t_name, lvl)
            time.sleep(1.2)