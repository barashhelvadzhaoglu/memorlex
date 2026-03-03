import os
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasındaki verileri (API_KEY_1, API_KEY_2 vb.) yükler
load_dotenv()

# 1. API Yapılandırması ve Key Havuzu
API_KEYS = [os.getenv("GEMINI_API_KEY_1"), os.getenv("GEMINI_API_KEY_2")]
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0

# 2. Model Listesi (Failover / Hata Toleransı Sırası)
# Gemini modelleri biterse Gemma 3 serisi (14.4K RPD kota) devreye girer
MODELS_TO_TRY = [
    "models/gemini-2.5-flash", 
    "models/gemini-3-flash",
    "models/gemini-2.5-flash-lite",
    "models/gemini-1.5-flash",
    "models/gemma-3-27b",
    "models/gemma-3-12b",
    "models/gemma-3-4b",
    "models/gemma-3-2b",
    "models/gemma-3-1b"
]

# 3. Konu Listesi (Münih - Stable Veri Seti)
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

def is_file_valid(file_path):
    """
    Kritik Kontrol: Dosyanın varlığını, JSON yapısını ve 
    senin istediğin 'meaning_es' (İspanyolca) alanının varlığını denetler.
    """
    if not file_path.exists():
        return False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # 'words' anahtarı senin orijinal formatının kalbi
            if isinstance(data, dict) and "words" in data and len(data["words"]) > 0:
                # İspanyolca verisi eksikse dosyayı geçersiz say ve yeniden üret
                has_spanish = "meaning_es" in data["words"][0]
                return has_spanish
            return False
    except Exception as e:
        print(f"⚠️ Dosya doğrulama hatası: {e}")
        return False

def generate_unit(lang, topic_key, topic_name, level):
    global current_key_index
    
    # Path Yapılandırması: src/data/vocabulary/de/a1/topic/topic_key.json
    base_dir = Path(__file__).parent.parent 
    save_path = base_dir / "src" / "data" / "vocabulary" / lang / level.lower() / "topic"
    save_path.mkdir(parents=True, exist_ok=True)
    file_path = save_path / f"{topic_key}.json"

    # Eğer dosya zaten dillerle birlikte doğruysa atla (Gereksiz API maliyetini önle)
    if is_file_valid(file_path):
        print(f"⏩ Atlanıyor (Zaten Güncel): {topic_key} ({level})")
        return

    # Seviyeye göre kelime sayısı tespiti
    word_count = {"a1": 15, "a2": 25, "b1": 35, "b2": 45, "c1": 60}.get(level.lower(), 30)
    
    # Her ünite için modelleri sırayla dene (Failover)
    for model_name in MODELS_TO_TRY:
        key = API_KEYS[current_key_index]
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={key}"
        
        # Senin tam veri formatını (words, type, tr/en/uk/es, example) dayatan prompt
        prompt_text = f"""
        Act as a professional German teacher. Create a vocabulary JSON for '{topic_name}' at {level.upper()} level.
        Requirements:
        1. Include exactly {word_count} unique items.
        2. Field 'term' MUST include articles for nouns (der/die/das).
        3. Field 'type' MUST be 'Noun', 'Verb', 'Adjective', 'Preposition', 'Adverb', or 'Conjunction'.
        4. Field 'example' MUST be a sentence where the term is replaced with '***'.
        5. Meanings MUST be in: 'meaning_tr' (Turkish), 'meaning_en' (English), 'meaning_uk' (Ukrainian), 'meaning_es' (Spanish).
        Return ONLY a raw JSON array of objects.
        """

        try:
            print(f"🚀 Deneniyor: {model_name} | Konu: {topic_key} ({level})")
            response = requests.post(url, json={"contents": [{"parts": [{"text": prompt_text}]}]}, timeout=60)
            
            if response.status_code == 200:
                res_json = response.json()
                raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
                
                # Markdown bloklarını temizle
                clean_json = raw_text.replace("```json", "").replace("```", "").strip()
                words_array = json.loads(clean_json)
                
                # AI bazen objeyi 'words' içine sarmalar, bazen direkt liste döner; her ikisini de yakala:
                if isinstance(words_array, dict):
                    if "words" in words_array:
                        words_array = words_array["words"]
                    else:
                        # Eğer başka bir anahtar altındaysa (örn: vocabulary) onu bul
                        for k in words_array:
                            if isinstance(words_array[k], list):
                                words_array = words_array[k]
                                break

                # Senin Next.js uygulamanın beklediği final JSON yapısı
                final_data = {
                    "title": f"{topic_name} ({level.upper()})",
                    "language": lang,
                    "words": words_array
                }
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(final_data, f, ensure_ascii=False, indent=2)
                
                print(f"✅ BAŞARILI: {topic_key} ({level}) - {model_name}")
                return # Ünite bitti, bir sonrakine geç
                
            elif response.status_code == 429:
                print(f"⚠️ {model_name} KOTA DOLDU. Sıradaki modele geçiliyor...")
                continue # For döngüsü sonraki modele devam eder
                
            else:
                print(f"❌ API HATASI ({response.status_code}): {model_name} başarısız.")
                # Hata koduna göre key değiştirme mantığı
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                time.sleep(2)
                
        except Exception as e:
            print(f"❌ BEKLENMEDİK HATA ({model_name}): {str(e)[:100]}")
            continue

    # Tüm modeller biterse fail mesajı
    print(f"🚨 KRİTİK HATA: {topic_key} için tüm modeller denendi ama sonuç alınamadı!")
    time.sleep(15) # Soğuma süresi

if __name__ == "__main__":
    print("🏁 MEMORLEX VERİ ÜRETİMİ BAŞLADI (Multi-Language Failover Mode)")
    print(f"🔑 Kullanılan API Key Sayısı: {len(API_KEYS)}")
    print(f"🤖 Denenecek Model Sayısı: {len(MODELS_TO_TRY)}")
    
    for lvl in ["a1", "a2", "b1", "b2", "c1"]:
        print(f"--- Seviye: {lvl.upper()} İşleniyor ---")
        for t_key, t_name in TOPICS:
            generate_unit("de", t_key, t_name, lvl)
            time.sleep(1.2) # Rate limitlere karşı güvenli bekleme

    print("🏁 TÜM OPERASYON TAMAMLANDI.")