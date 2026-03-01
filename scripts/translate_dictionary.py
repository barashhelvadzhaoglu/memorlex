import os
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasındaki verileri yükle
load_dotenv()

# 1. API Yapılandırması (Environment Variables)
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2")
]
# None olanları temizle
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0

def get_latest_flash_model(api_key):
    """Kullanılabilir en güncel Gemini Flash modelini bulur."""
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

def translate_dictionary():
    global current_key_index
    
    base_dir = Path(__file__).parent.parent
    # Almanca sözlük dosyasının yolu
    dict_path = base_dir / "src" / "data" / "dictionary" / "de" / "dictionary.json"
    
    if not dict_path.exists():
        print(f"❌ Sözlük dosyası bulunamadı: {dict_path}")
        return

    with open(dict_path, 'r', encoding='utf-8') as f:
        words = json.load(f)

    print(f"🔄 Toplam {len(words)} kelime kontrol ediliyor...")

    for i, word_data in enumerate(words):
        # Eğer tüm diller zaten varsa atla
        required_keys = ['meaning_tr', 'meaning_en', 'meaning_uk', 'meaning_es']
        if all(key in word_data for key in required_keys) and word_data.get('example'):
            continue

        word = word_data.get('term')
        print(f"🌐 Çevriliyor ({i+1}/{len(words)}): {word}")

        success = False
        while not success:
            if not API_KEYS:
                print("❌ API anahtarı bulunamadı! .env dosyasını kontrol edin.")
                return

            key = API_KEYS[current_key_index]
            model_name = get_latest_flash_model(key)
            url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={key}"

            prompt = f"""
            Translate the German word '{word}' and provide details in JSON format.
            Required fields:
            - meaning_tr: Turkish translation
            - meaning_en: English translation
            - meaning_uk: Ukrainian translation
            - meaning_es: Spanish translation
            - type: word type (noun, verb, adj, etc.)
            - example: A short German example sentence.
            
            Return ONLY raw JSON.
            """

            try:
                response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=30)
                
                if response.status_code == 200:
                    raw_res = response.json()['candidates'][0]['content']['parts'][0]['text']
                    clean_res = raw_res.replace("```json", "").replace("```", "").strip()
                    translated_data = json.loads(clean_res)
                    
                    # Mevcut veriyi güncelle
                    words[i].update(translated_data)
                    
                    # Her 5 kelimede bir dosyayı kaydet (güvenlik için)
                    if i % 5 == 0:
                        with open(dict_path, 'w', encoding='utf-8') as f:
                            json.dump(words, f, ensure_ascii=False, indent=2)
                    
                    success = True
                    print(f"✅ Tamamlandı: {word}")
                
                elif response.status_code == 429:
                    print("⚠️ Kota doldu, anahtar değiştiriliyor...")
                    current_key_index = (current_key_index + 1) % len(API_KEYS)
                    time.sleep(10)
                else:
                    print(f"❌ Hata {response.status_code}, bekleniyor...")
                    time.sleep(5)
                    success = True # Hatalı kelimeyi geçmek için

            except Exception as e:
                print(f"❌ Beklenmedik Hata: {e}")
                time.sleep(5)
                success = True

    # Final Kayıt
    with open(dict_path, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    print("✨ Sözlük başarıyla güncellendi!")

if __name__ == "__main__":
    translate_dictionary()