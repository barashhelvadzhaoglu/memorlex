import json
import os
from datetime import datetime
from typing import Optional
import random
import re
import requests
import time
from dotenv import load_dotenv

load_dotenv()

API_KEYS = []
for key_name in ["GEMINI_API_KEY_1", "GEMINI_API_KEY_2", "GEMINI_API_KEY"]:
    val = os.getenv(key_name)
    if val and val.strip():
        API_KEYS.append(val.strip())

MODELS_TO_TRY = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
]

WEEKLY_SCHEDULE = {
    0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: None, 6: None,
}

LEVEL_CONFIG = {
    "a1": {"scenes": 7,  "sentences": 2, "max_chars": 120, "max_tokens": 4096,
           "desc": "Sehr einfache, kurze Sätze. Grundbedürfnisse, Uhrzeit, Preise fragen."},
    "a2": {"scenes": 10, "sentences": 2, "max_chars": 140, "max_tokens": 4096,
           "desc": "Perfekt und Präsens gemischt. Alltag, einfache Dialoge."},
    "b1": {"scenes": 14, "sentences": 3, "max_chars": 180, "max_tokens": 8192,
           "desc": "Nebensätze, Modalverben, formelle Texte. Mittellange Sätze."},
    "b2": {"scenes": 18, "sentences": 3, "max_chars": 200, "max_tokens": 8192,
           "desc": "Konjunktiv II, abstrakte Themen, akademische Diskussionen."},
    "c1": {"scenes": 22, "sentences": 3, "max_chars": 220, "max_tokens": 8192,
           "desc": "Akademische Analysen, philosophische Perspektiven, Nominalstil."},
}

EXAM_LOGIC = {
    "a1": "Kısa mesajlar, basit form doldurma ve temel alışveriş fiyatları.",
    "a2": "Hava durumu, istasyon anonsları, yol çalışmaları, restoran ve doktor randevuları.",
    "b1": "İş hayatı, çevre, medya, şikayet yönetimi ve resmi başvurular.",
    "b2": "Sürdürülebilirlik, globalleşme, teknolojik etik ve kariyer planlama.",
    "c1": "Sosyolojik analizler, tarihsel bağlamlar, soyut kavramlar, akademik terminoloji.",
}

TOPIC_POOL = [
    "Alltag: Oktoberfest München mit Budgetplanung",
    "Wetter: Wintereinbruch in Bayern, Folgen für die Bahn",
    "Verkehr: Baustellen A99, Umleitungen für Pendler",
    "Einkauf: Preisvergleich Discounter vs. Biomarkt",
    "Gesundheit: Apotheken-Notdienst nachts finden",
    "Wohnen: Mülltrennung-Anleitung für neue Mieter",
    "Freizeit: Wochenendausflug Allianz Arena planen",
    "Kommunikation: Durchsage Flughafen Gate-Wechsel",
    "Beruf: Vorstellungsgespräch bei deutschem Mittelständler",
    "Bildung: Duales Studium - Praxis und Theorie",
    "Bürokratie: Kindergeld beantragen, Formulare verstehen",
    "Umwelt: Solarpflicht für Neubauten in Deutschland",
    "Technik: Industrie 4.0 - Roboter in der Autoproduktion",
    "Wirtschaft: Handwerk in Deutschland - goldener Boden",
    "Digitalisierung: Bargeldlose Zahlung vs. Bargeld-Kultur",
    "Geschichte: 35 Jahre Deutsche Einheit",
    "Kultur: Vereinsleben und Integration in Deutschland",
    "Wissenschaft: Quantencomputing am Max-Planck-Institut",
    "Philosophie: Ethik der KI im deutschen Recht",
    "Architektur: Vom Bauhaus zum Passivhaus-Standard",
    "Soziologie: Demografischer Wandel und Rente",
    "Politik: Das föderale System in Deutschland",
    "Umwelt: Energiewende ohne Atomkraft - machbar?",
    "Psychologie: Work-Life-Balance in der deutschen Arbeitskultur",
    "Transport: Autobahn-Geschichte, Deutschlandticket, Fahrradstädte",
    "Städte: Hamburgs Speicherstadt, Ruhrgebiet Industriekultur",
    "Wissenschaft: Deutsche Erfinder - Gutenberg, Benz, Einstein",
]

HASHTAGS = [
    "#DeutschLernen", "#LearnGerman", "#Deutsch", "#GermanLanguage",
    "#DeutschKurs", "#DeutschAlsFremdsprache", "#DAF",
    "#Lesen", "#Hören", "#Leseverstehen", "#Hörverstehen",
    "#GoetheZertifikat", "#Telc", "#TestDaF", "#DSH",
    "#Deutschkenntnisse", "#DeutschOnline", "#DeutschÜben",
    "#Sprachkurs", "#Sprachenlernen", "#Mehrsprachig",
    "#DeutschFürAnfänger", "#DeutschFürFortgeschrittene",
    "#Vokabeln", "#Grammatik", "#DeutschSprechen",
    "#Integrationskurs", "#Germany", "#Deutschland", "#Berlin", "#München",
    "#Memorlex", "#LanguageLearning", "#Flashcards",
]


def get_current_level(override: Optional[str] = None) -> Optional[str]:
    if override:
        lvl = override.lower().strip()
        if lvl in LEVEL_CONFIG:
            return lvl
        print(f"⚠️ Geçersiz seviye: '{override}'. Geçerli: a1 a2 b1 b2 c1")
        return None
    return WEEKLY_SCHEDULE.get(datetime.now().weekday())


def get_next_filename(directory):
    if not os.path.exists(directory):
        return "storie-001.json"
    numbers = set()
    for f in os.listdir(directory):
        m = re.search(r"storie-(\d+)\.json", f)
        if m:
            numbers.add(int(m.group(1)))
    n = 1
    while n in numbers:
        n += 1
    return f"storie-{n:03d}.json"


def get_previous_story_vocab(save_dir: str, count: int = 15) -> list:
    if not os.path.exists(save_dir):
        return []
    json_files = sorted([f for f in os.listdir(save_dir) if f.startswith("storie-") and f.endswith(".json")])
    if not json_files:
        return []
    try:
        with open(os.path.join(save_dir, json_files[-1]), "r", encoding="utf-8") as f:
            data = json.load(f)
        vocab = data.get("vocab", [])
        sample = random.sample(vocab, min(count, len(vocab)))
        print(f"🔗 Önceki hikayeden {len(sample)} köprü kelimesi alındı: {json_files[-1]}")
        return sample
    except Exception as e:
        print(f"⚠️ Önceki hikaye okunamadı: {e}")
        return []


def call_gemini(prompt, api_key, model_name, max_tokens):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": max_tokens},
    }
    response = requests.post(url, json=payload, timeout=120)
    response.raise_for_status()
    return response.json()['candidates'][0]['content']['parts'][0]['text']


def parse_json_safe(raw_text: str) -> dict:
    """JSON'u bul, temizle ve parse et."""
    text = raw_text.strip()

    # Kod blogu varsa ic kismi al
    if "```" in text:
        for part in text.split("```"):
            part = part.strip().lstrip("json").strip()
            if part.startswith("{"):
                text = part
                break

    # { ... } araligini bul
    start = text.find("{")
    end   = text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]

    # Almanca tirnak isaretlerini standart tirnak ile degistir
    text = text.replace("\u201e", '"').replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2018", "'").replace("\u2019", "'")

    # Satir sonu karakterlerini temizle
    text = text.replace("\r\n", "\\n").replace("\r", "\\n")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Son care: json icindeki kontrolsuz satir sonlarini temizle
        import re
        # String icindeki literal newline'lari \\n ile degistir
        def fix_newlines(m):
            return m.group(0).replace('\n', '\\n').replace('\t', '\\t')
        text = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', fix_newlines, text, flags=re.DOTALL)
        return json.loads(text)


def generate_story(level_override: Optional[str] = None):
    if not API_KEYS:
        print("❌ HATA: API key bulunamadı! .env kontrol et.")
        return

    level = get_current_level(level_override)
    if level is None:
        print("🗓️ Bugün tatil günü (Cumartesi/Pazar). Hikaye üretilmiyor.")
        return

    cfg = LEVEL_CONFIG[level]
    print(f"📅 Seviye: {level.upper()} | {cfg['scenes']} sahne | max {cfg['max_chars']} karakter/sahne")

    topics = random.sample(TOPIC_POOL, 2)
    save_dir = os.path.join("src", "data", "stories", "de", level)
    bridge_vocab = get_previous_story_vocab(save_dir, count=15)

    if bridge_vocab:
        bridge_terms = ", ".join(f'"{v["term"]}"' for v in bridge_vocab)
        bridge_block = (
            f"KÖPRÜ KELİMELER: Şu {len(bridge_vocab)} kelimeyi text sahnelerinde doğal kullan, "
            f"vocab listesine EKLEME: [{bridge_terms}]"
        )
    else:
        bridge_block = "KÖPRÜ KELİMELER: İlk hikaye, köprü kelime gerekmez."

    prompt = f"""Sen bir Goethe/Telc sınav uzmanısın. {level.upper()} seviyesinde video hikayesi üret.

KURALLAR:
- KONU: {topics} konularını harmanla
- SAHNE SAYISI: Tam {cfg['scenes']} sahne (text dizisinde tam {cfg['scenes']} eleman)
- SAHNE UZUNLUĞU: Her sahne max {cfg['sentences']} cümle, max {cfg['max_chars']} karakter (video altyazısı için kısa tut)
- SEVİYE: {cfg['desc']}
- SINAV VERİLERİ: Saatler, fiyatlar, tarihler, peron/kapı numaraları mutlaka ekle
- SINAV STRATEJİSİ: {EXAM_LOGIC[level]}
- VOCAB: Tam 15-20 adet YENİ kelime. {bridge_block}
- SORULAR: 8-10 çoktan seçmeli soru, yarısı kilit verileri sorgulasın
- IMAGE PROMPTS: Her sahne için 1 İngilizce Stable Diffusion promptu (text ile aynı eleman sayısı)

JSON GÜVENLİK KURALLARI (ÇOK ÖNEMLİ):
- String değerlerin içinde çift tırnak (") kullanma, yerine tek tırnak (') kullan
- Almanca tırnak işaretleri „" kullanma, düz tırnak kullan
- Satır sonu için \\n kullan, gerçek satır sonu koyma
- Özel karakterleri (ä ö ü ß) olduğu gibi yaz, escape etme

SADECE geçerli JSON döndür, açıklama veya markdown ekleme:
{{
  "id": "storie-ID",
  "level": "{level}",
  "youtubeId": "",
  "title": "Almanca Başlık",
  "summary": "Almanca max 2 cümle özet.",
  "hashtags": {json.dumps(HASHTAGS, ensure_ascii=False)},
  "text": ["sahne1", "sahne2", "...{cfg['scenes']} eleman"],
  "image_prompts": ["realistic photo, scene1, cinematic lighting", "...{cfg['scenes']} eleman"],
  "vocab": [{{"term":"kelime","type":"Nomen","meaning_tr":"TR","meaning_en":"EN","meaning_es":"ES","meaning_uk":"UA","example":"örnek"}}],
  "questions": [{{"question":"soru","options":["A","B","C","D"],"answer":"doğru"}}]
}}"""

    for api_key in API_KEYS:
        for model_name in MODELS_TO_TRY:
            for attempt in range(1, 4):  # Her model icin max 3 deneme
                try:
                    print(f"🚀 {model_name} | Key: {api_key[:12]}... | Deneme {attempt}/3")
                    raw = call_gemini(prompt, api_key, model_name, cfg['max_tokens'])
                    data = parse_json_safe(raw)

                    actual = len(data.get("text", []))
                    print(f"📊 Sahne: {actual} (hedef: {cfg['scenes']}) | Vocab: {len(data.get('vocab',[]))} | Soru: {len(data.get('questions',[]))}")

                    file_name = get_next_filename(save_dir)
                    file_path = os.path.join(save_dir, file_name)
                    data["id"] = file_name.replace(".json", "")
                    data["level"] = level
                    data["hashtags"] = HASHTAGS

                    os.makedirs(save_dir, exist_ok=True)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)

                    print(f"✅ BAŞARILI: {file_path}")
                    return

                except requests.exceptions.HTTPError as e:
                    status = e.response.status_code if e.response else "?"
                    if status == 429:
                        print(f"⚠️ Kota dolu (429) — {model_name}")
                    elif status == 404:
                        print(f"❌ Model bulunamadı — {model_name}")
                    else:
                        body = e.response.text[:150] if e.response else ""
                        print(f"❌ HTTP {status} — {model_name}: {body}")
                    time.sleep(2)
                    break  # HTTP hatada sonraki modele gec

                except requests.exceptions.Timeout:
                    print(f"⏱️ Timeout — {model_name} (deneme {attempt}/3)")
                    time.sleep(5)

                except (json.JSONDecodeError, KeyError) as e:
                    print(f"⚠️ JSON parse hatası ({model_name}, deneme {attempt}/3): {str(e)[:100]}")
                    if attempt < 3:
                        print(f"   🔄 5 saniye bekleyip tekrar deneniyor...")
                        time.sleep(5)

                except Exception as e:
                    print(f"⚠️ Hata ({model_name}): {type(e).__name__}: {str(e)[:100]}")
                    time.sleep(2)
                    break

    print("🚨 TÜM KEY VE MODELLER DENENDİ, SONUÇ ALINAMADI.")


if __name__ == "__main__":
    import sys
    generate_story(level_override=sys.argv[1] if len(sys.argv) > 1 else None)