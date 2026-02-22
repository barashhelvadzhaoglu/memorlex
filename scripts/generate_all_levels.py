import google.generativeai as genai
import json
import os
from datetime import datetime
import random
import re

# API Yapılandırması
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def get_latest_flash_model():
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        flash_models = [n for n in models if 'flash' in n]
        return sorted(flash_models, reverse=True)[0] if flash_models else 'gemini-1.5-flash'
    except:
        return 'gemini-1.5-flash'

def get_next_filename(directory):
    if not os.path.exists(directory):
        return "storie-001.json"
    files = [f for f in os.listdir(directory) if f.startswith("storie-") and f.endswith(".json")]
    if not files:
        return "storie-001.json"
    numbers = [int(re.search(r"storie-(\d+)", f).group(1)) for f in files if re.search(r"storie-(\d+)", f)]
    next_number = max(numbers) + 1 if numbers else 1
    padding = max(3, len(str(next_number)))
    return f"storie-{next_number:0{padding}d}.json"

model = genai.GenerativeModel(get_latest_flash_model())

def generate_story():
    weekday = datetime.now().weekday()
    levels_map = {0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: "a1", 6: "a1"}
    current_level = levels_map.get(weekday, "a1")

    # UZATILMIŞ VE DETAYLANDIRILMIŞ LEVEL SPECS
    level_specs = {
        "a1": "Basit ve kısa cümleler. Tanışma, temel ihtiyaçlar, saat ve fiyat sorma gibi hayati günlük dialoglar. Kelime haznesi sınırlı (A1 seviye sertifika kelimeleri). Şimdiki zaman ağırlıklı, somut rakamlar (saat, fiyat, peron) doğrudan ve net bir şekilde sorulur. Karmaşık bağlaçlardan kaçınılır. Hedef: ~150-200 kelime.",
        "a2": "Geçmiş zaman (Perfekt) ve şimdiki zaman karışık. Günlük hayat anonsları, basit e-posta/mektup dili, temel bağlaçlar (und, aber, weil, dann). Karmaşık olmayan betimlemeler ve kişisel deneyimlerin aktarımı. Rakamlar ve kilit veriler metin içinde hafif dağınık verilir, doğrudan okuma/anlama becerisi test edilir. Hedef: ~250-350 kelime.",
        "b1": "Resmi yazışmalar, radyo programı veya vlog tadında anlatımlar, fikir beyan etme (Meinung äußern). Yan cümleler (Nebensätze: dass, obwohl, wenn), pasif yapı başlangıcı ve modal fiillerin yoğun kullanımı. Sosyal konular, iş yaşamı ve eğitim üzerine odaklanır. Sınav formatına uygun olarak 'tuzak' bilgiler (örneğin iki farklı saat veya fiyat verilip hangisinin asıl olduğu) sorgulanır. Hedef: ~400-500 kelime.",
        "b2": "Akademik ve profesyonel tartışmalar, detaylı gazete makaleleri, varsayımsal durumlar (Konjunktiv II) ve gelecek zaman (Futur I/II). Soyut kavramlar üzerine analizler, hipotez kurma ve sebep-sonuç ilişkilerinin derinleştirilmesi. Karmaşık deyimler, atasözleri ve profesyonel sunum dili kullanılır. Somut veriler metnin akışına gizlenir, doğrudan sormak yerine çıkarım (Inference) yapılması beklenir. Hedef: ~550-650 kelime.",
        "c1": "Çok katmanlı akademik analizler, toplumsal değişimlerin derinlemesine incelenmesi, tarihsel ve felsefi perspektifler. İnce anlam farkları (Nuancen), üst düzey retorik araçlar ve nominal stil (Nominalstil) kullanımı. Metinler arası referanslar ve yüksek düzeyde deyimsel ifadeler. Veriler çok katmanlıdır; bütçe analizleri, istatistiksel kıyaslamalar ve kronolojik karmaşıklıklar içerir. Hedef: ~750-900 kelime."
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
    Sen bir Goethe/Telc dil sınavı uzmanısın. {current_level.upper()} seviyesinde sınav formatına tam eşdeğer bir içerik üret.
    
    KRİTİK TALİMATLAR:
    1. KONU: {selected_topics} konularını birbiriyle harmanla.
    2. PERSPEKTİF: Hikayeyi her seferinde farklı bir bireyin (örn: Hamburg'lu bir öğrenci, Berlin'e yeni taşınan bir sanatçı, emekli bir gezgin vb.) gözünden anlat.
    3. SINAV FORMATI (TUZAK BİLGİLER): Metin içine mutlaka kilit veriler ekle:
       - Saatler, Fiyatlar, Tarihler, Peron ve Kapı Numaraları.
    4. SORULAR (SEVİYE ODAKLI): 8-10 soru hazırla. Soruların yarısı yukarıdaki kilit verileri (saat, tarih, fiyat vb.) sorgulamalı. 
       - Seviye arttıkça (B1+) sorular doğrudan bilgi yerine çıkarım gerektirmelidir.
    5. YOUTUBE: Akıcı, doğal bir vlog seslendirme dili.
    6. SEVİYE KRİTERİ: {level_specs[current_level]}
    
    JSON FORMATI:
    {{
      "id": "storie-ID",
      "youtubeId": "",
      "title": "Almanca Başlık",
      "summary": "NUR AUF DEUTSCH! (Max. 2 Sätze)",
      "text": ["Paragraf 1", "Paragraf 2", "..."],
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
    (Vocab: 15-20 adet.)
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = json.loads(content)
        save_dir = os.path.join("src", "data", "stories", "de", current_level)
        file_name = get_next_filename(save_dir)
        file_path = os.path.join(save_dir, file_name)
        data["id"] = file_name.replace(".json", "")
        
        os.makedirs(save_dir, exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Başarılı: {file_path} yazıldı. (Seviye: {current_level.upper()})")

    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        raise e

if __name__ == "__main__":
    generate_story()
