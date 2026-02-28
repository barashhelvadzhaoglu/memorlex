import os
import json
import time
import google.generativeai as genai
from pathlib import Path

# 1. API Yapılandırması
api_key = "AIzaSyBocHnYJMTwWYVzclSyvOsHn4MYyHMGJbM"
genai.configure(api_key=api_key)

def get_best_model():
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        flash_models = [n for n in models if 'flash' in n]
        return sorted(flash_models, reverse=True)[0] if flash_models else 'models/gemini-1.5-flash'
    except Exception:
        return 'models/gemini-1.5-flash'

active_model_name = get_best_model()
model = genai.GenerativeModel(active_model_name)
print(f"🤖 Aktif Model: {active_model_name}")

def get_word_count(level):
    counts = {"a1": 12, "a2": 20, "b1": 30, "b2": 40, "c1": 55}
    return counts.get(level.lower(), 25)

TOPICS = [
    ("basics", "Grundlagen & Begrüßung"), ("family", "Familie & Beziehungen"),
    ("food", "Essen & Trinken"), ("shopping", "Einkaufen & Geld"),
    ("home", "Haus & Wohnen"), ("body", "Körper & Aussehen"),
    ("health", "Gesundheit & Krankheit"), ("colors-numbers", "Farben & Zahlen"),
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
    ("art-literature", "Kunst & Literatur"), ("music-cinema", "Musik & Kino"),
    ("psychology", "Psychologie & Gefühle"), ("philosophy", "Philosophie & Werte"),
    ("religion-spirituality", "Religion & Spiritualität"), ("science-research", "Wissenschaft & Forschung"),
    ("society-problems", "Gesellschaftliche Probleme"), ("globalization", "Globalisierung"),
    ("migration-integration", "Migration & Integration"), ("ethics-ai", "Ethik & KI"),
    ("future-trends", "Zukunftstrends"), ("media-criticism", "Medienkritik"),
    ("astronomy-space", "Astronomie & Weltraum"), ("architecture", "Architektur"),
    ("sports-nutrition", "Leistungssport & Ernährung"), ("tourism-impact", "Massentourismus & Folgen")
]

def generate_unit(lang, topic_key, topic_name, level):
    base_dir = Path(__file__).parent.parent 
    save_path = base_dir / "src" / "data" / "vocabulary" / lang / level.lower() / "topic"
    save_path.mkdir(parents=True, exist_ok=True)
    file_path = save_path / f"{topic_key}.json"

    if file_path.exists(): 
        print(f"⏩ Atlanıyor (Dosya Mevcut): {topic_key} ({level})")
        return

    word_count = get_word_count(level)
    
    # ✅ RETRY LOGIC: Dosya başarıyla yazılana kadar döngüden çıkmaz
    success = False
    while not success:
        print(f"🚀 Üretiliyor: {topic_name} - {level.upper()}...")
        
        prompt = f"""
        Create a German (de) vocabulary JSON for '{topic_name}' at {level.upper()} level.
        Include {word_count} items.
        Format: JSON only, title: '{topic_name} {level.upper()}', language: 'de'.
        Fields: term, type, meaning_tr, meaning_en, meaning_uk, meaning_es, example (with ***).
        """

        try:
            response = model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text.strip())
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ KAYDEDİLDİ: {file_path.relative_to(base_dir)}")
            success = True # İşlem başarılı, döngü kırılır
            
        except Exception as e:
            err = str(e)
            if "429" in err:
                print(f"⏳ KOTA DOLDU: {topic_key} ({level}) kaydedilemedi. 70sn bekleniyor ve TEKRAR denenecek...")
                time.sleep(70) # Kota sıfırlanması için logdaki süreden biraz fazla bekliyoruz
            else:
                print(f"❌ HATA: {err[:100]}. 10sn sonra aynı dosya tekrar denenecek...")
                time.sleep(10)

if __name__ == "__main__":
    current_lang = "de"
    target_levels = ["a1", "a2", "b1", "b2", "c1"]

    for t_key, t_name in TOPICS:
        for lvl in target_levels:
            generate_unit(current_lang, t_key, t_name, lvl)
            time.sleep(5.0) # Her başarılı dosyadan sonra 5sn mola

    print("\n🏁 İşlem bitti, tüm dosyalar eksiksiz oluşturuldu!")