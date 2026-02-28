import os
import json
import time
import google.generativeai as genai
from pathlib import Path

# 1. API Yapılandırması
api_key = "AIzaSyBocHnYJMTwWYVzclSyvOsHn4MYyHMGJbM"
genai.configure(api_key=api_key)

def get_best_model():
    """Sistemde çalışan en güncel flash modelini bulur."""
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        # Önce 1.5 flash, bulamazsa 1.0 flash, o da yoksa varsayılan
        flash_models = [n for n in models if 'flash' in n]
        return sorted(flash_models, reverse=True)[0] if flash_models else 'models/gemini-1.5-flash'
    except Exception:
        return 'models/gemini-1.5-flash'

# Dinamik model seçimi
SELECTED_MODEL = get_best_model()
model = genai.GenerativeModel(SELECTED_MODEL)

# 2. Dosya Yolları ve Dil Ayarları
BASE_PATH = Path("src/data")
VOCAB_PATH = BASE_PATH / "vocabulary"
STORY_PATH = BASE_PATH / "stories"
ALL_MEANINGS = ["tr", "en", "uk", "es", "de"]

def ask_gemini_json(prompt):
    """Gemini'den temiz JSON çıktısı alır."""
    try:
        time.sleep(1.5) # Rate limit koruması
        response = model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Gemini Hatası: {e}")
        return None

def sync_all():
    print(f"🚀 Mega Sync & Optimization System Activated...")
    print(f"🤖 Kullanılan Model: {SELECTED_MODEL}")
    
    # Hem vocabulary hem stories klasörlerini tara
    for base_type in [VOCAB_PATH, STORY_PATH]:
        if not base_type.exists():
            continue
        
        # de, tr, en, es klasörlerini tek tek gez
        for lang_folder in ["de", "tr", "en", "es"]:
            current_path = base_type / lang_folder
            if not current_path.exists():
                continue

            for root, _, files in os.walk(current_path):
                for file in files:
                    if not file.endswith(".json"):
                        continue
                    
                    file_path = Path(root) / file
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Dosya formatına göre listeyi bul (words veya vocab)
                    items = data.get('words') or data.get('vocab', [])
                    if not items:
                        continue

                    # Klasörün dilini hariç tut (Gereksiz veri tekrarını önler)
                    target_langs = [m for m in ALL_MEANINGS if m != lang_folder]
                    
                    print(f"🔄 İşleniyor: {lang_folder.upper()} / {file}...")

                    # F-string hatasını önlemek için veriyi dışarıda hazırlayalım
                    input_data = []
                    for i in items:
                        input_data.append({
                            "term": i['term'],
                            "current": {k: i.get(f'meaning_{k}') for k in target_langs}
                        })

                    # GÜÇLENDİRİLMİŞ PROMPT: 'meaning_es' ve 'meaning_uk' zorunlu hale getirildi.
                    prompt = f"""
                    Role: Professional Polyglot Linguist.
                    Task: REVISE and ENRICH the dictionary terms.
                    
                    Mandatory Target Languages: {target_langs}
                    
                    Instructions:
                    1. For each term, you MUST provide a meaning for ALL these languages: {target_langs}.
                    2. MISSING FIELDS: If 'meaning_es' or 'meaning_uk' is missing in the input, you MUST create them.
                    3. SYNONYM RULE: Use 2-3 synonyms where a single word is insufficient.
                    4. FORMAT RULE: Strictly DO NOT use commas (,). Use ' - ' (dash with spaces) instead. (Example: 'stop - station').
                    5. CONSISTENCY: Ensure all results are high-quality and context-appropriate.
                    6. OUTPUT: Return ONLY a JSON object where each key is the 'term' and the value contains the translations.
                    
                    Input JSON: {json.dumps(input_data)}
                    """
                    
                    translations = ask_gemini_json(prompt)
                    
                    if translations:
                        for item in items:
                            term = item['term']
                            if term in translations:
                                for lang_code in target_langs:
                                    # Gemini'den gelen veriyi dile göre al (Örn: 'es' veya 'meaning_es')
                                    # Hem 'es' hem 'meaning_es' anahtarlarını kontrol ederek esneklik sağlıyoruz.
                                    val = translations[term].get(lang_code) or translations[term].get(f'meaning_{lang_code}')
                                    if val:
                                        item[f'meaning_{lang_code}'] = val
                        
                        # Data Integrity: Dosyanın kendi diline ait 'meaning_xx' alanı varsa sil (Temizlik)
                        redundant_key = f'meaning_{lang_folder}'
                        for item in items:
                            if redundant_key in item:
                                del item[redundant_key]

                        # Dosyayı orijinal formatında (indent=2) ve Türkçe karakterleri bozmadan kaydet
                        with open(file_path, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        
                        print(f"✅ {file} başarıyla zenginleştirildi (ES/UK eklendi).")

if __name__ == "__main__":
    sync_all()
    print("🏁 Tüm işlemler başarıyla tamamlandı.")