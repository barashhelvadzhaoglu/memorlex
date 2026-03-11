import json, os, glob, requests, time, random
from dotenv import load_dotenv
load_dotenv('/Users/user/memorlex/.env')

API_KEY = os.getenv('GEMINI_API_KEY_2')
BASE = '/Users/user/memorlex/src/data/stories/de'

import random

def get_vocab_count(level):
    ranges = {
        'a1': (15, 17), 'a2': (15, 17),
        'b1': (16, 19), 'b2': (17, 20), 'c1': (18, 20)
    }
    lo, hi = ranges.get(level, (15, 20))
    return random.randint(lo, hi)

LEVEL_HASHTAGS = {
    'a1': ["#DeutschA1", "#A1Deutsch", "#GermanA1", "#AlemanA1", "#НімецькаA1",
           "#DeutschAnfänger", "#BeginnerGerman", "#AlemánParaPrincipiantes",
           "#A1Prüfung", "#GoetheA1", "#TelcA1", "#EinfachesDeutsch"],
    'a2': ["#DeutschA2", "#A2Deutsch", "#GermanA2", "#AlemanA2", "#НімецькаA2",
           "#A2Prüfung", "#GoetheA2", "#TelcA2", "#StartDeutsch",
           "#DeutschElementar", "#ElementaryGerman", "#AlemánElemental"],
    'b1': ["#DeutschB1", "#B1Deutsch", "#GermanB1", "#AlemanB1", "#НімецькаB1",
           "#B1Prüfung", "#GoetheB1", "#TelcB1", "#TestDaFB1",
           "#ZertifikatDeutsch", "#B1Zertifikat", "#DeutschMittelstufe",
           "#IntermediateGerman", "#AlemánIntermedio"],
    'b2': ["#DeutschB2", "#B2Deutsch", "#GermanB2", "#AlemanB2", "#НімецькаB2",
           "#B2Prüfung", "#GoetheB2", "#TelcB2", "#TestDaFB2",
           "#B2Zertifikat", "#UpperIntermediateGerman", "#AlemánAvanzado",
           "#DSH", "#DeutschOberstufe"],
    'c1': ["#DeutschC1", "#C1Deutsch", "#GermanC1", "#AlemanC1", "#НімецькаC1",
           "#C1Prüfung", "#GoetheC1", "#TelcC1", "#TestDaFC1",
           "#C1Zertifikat", "#AdvancedGerman", "#AlemánExperto",
           "#DSH", "#DeutschFürStudium", "#AkademischesDeutsch"],
}

COMMON_HASHTAGS = [
    "#DeutschLernen", "#LearnGerman", "#Deutsch", "#GermanLanguage",
    "#DeutschKurs", "#DeutschAlsFremdsprache", "#DAF",
    "#Leseverstehen", "#Hörverstehen", "#Vokabeln", "#Grammatik",
    "#Sprachkurs", "#Sprachenlernen", "#DeutschÜben",
    "#Prüfung", "#PrüfungÜben", "#DeutschPrüfung", "#PrüfungTipps",
    "#PrüfungVorbereitung", "#Prüfungsübungen", "#DeutschTest",
    "#SprachprüfungDeutsch", "#PrüfungErfolg",
    "#Türkçe", "#Turkish", "#Türkisch",
    "#English", "#İngilizce", "#Englisch",
    "#Español", "#İspanyolca", "#Spanisch",
    "#Українська", "#Ukrainian", "#Ukrainisch",
    "#Mehrsprachig", "#Multilingual", "#Çokdilli",
    "#SınavHazırlık", "#ExamPrep", "#Prüfungsvorbereitung", "#PreparaciónExamen",
    "#Flashcards", "#Memorlex", "#LanguageLearning",
    "#Germany", "#Deutschland", "#Berlin", "#München",
]

def call_gemini(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    r = requests.post(url, json={
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 8192}
    }, timeout=60)
    if r.status_code != 200:
        import traceback; traceback.print_exc(); return None
    raw = r.json()['candidates'][0]['content']['parts'][0]['text']
    return raw.strip().replace('```json', '').replace('```', '').strip()

def parse_json_safe(raw):
    """JSON parse - birkaç strateji dene"""
    # 1. Direkt
    try:
        return parse_json_safe(raw)
    except:
        pass
    # 2. Tek tırnakları çift tırnağa çevir
    try:
        import re
        fixed = re.sub(r"'([^']*)':", r'"\1":', raw)
        return json.loads(fixed)
    except:
        pass
    # 3. Sadece array kısmını al
    try:
        start = raw.find('[')
        end = raw.rfind(']') + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
    except:
        pass
    return None

def get_new_vocab(text_lines, level):
    text = ' '.join(text_lines)
    count = get_vocab_count(level)
    difficulty = {
        'a1': 'einfach aber nicht trivial — alltägliche aber lehrreiche Wörter',
        'a2': 'einfach bis mittelschwer — nützliche Alltagsvokabeln',
        'b1': 'mittelschwer — typische Prüfungsvokabeln für B1',
        'b2': 'schwer — anspruchsvolle Vokabeln für B2-Prüfungen',
        'c1': 'sehr schwer — akademische und seltene Ausdrücke für C1',
    }.get(level, 'mittelschwer')

    prompt = f"""Du bist ein Deutsch-Sprachexperte. Analysiere diesen Text (Niveau {level.upper()}) und wähle genau {count} seltene, schwierige und lehrreiche Wörter aus.

REGELN:
- KEINE Grundvokabeln: haben, sein, gehen, gut, Tag, Haus, Mann, Frau, Kind, kommen, machen usw.
- Bevorzuge: seltene Nomen, Fachbegriffe, trennbare Verben, komplexe Adjektive, idiomatische Ausdrücke
- Nomen IMMER mit Artikel: "das Haus", "der Mann", "die Frau"
- Schwierigkeitsgrad: {difficulty}

TEXT:
{text}

Antworte NUR mit JSON-Array ohne Markdown:
[
  {{
    "term": "Wort (mit Artikel bei Nomen)",
    "type": "Nomen|Verb|Adjektiv|Adverb|Phrase",
    "meaning_tr": "Türkçe",
    "meaning_en": "English",
    "meaning_es": "Español",
    "meaning_uk": "Українська",
    "example": "Beispielsatz"
  }}
]"""

    raw = call_gemini(prompt)
    if not raw:
        import traceback; traceback.print_exc(); return None
    try:
        return parse_json_safe(raw)
    except:
        import traceback; traceback.print_exc(); return None

def update_hashtags(d):
    level = d.get('level', 'b1')
    level_tags = LEVEL_HASHTAGS.get(level, [])
    all_tags = level_tags + COMMON_HASHTAGS
    seen = set()
    unique_tags = []
    for tag in all_tags:
        if tag not in seen:
            seen.add(tag)
            unique_tags.append(tag)
    d['hashtags'] = unique_tags
    return d

# Tüm seviyelerdeki tüm JSON'ları bul
files = sorted(glob.glob(f'{BASE}/**/*.json', recursive=True))
print(f"📚 {len(files)} hikaye bulundu\n")

total_vocab = 0
total_hashtag = 0

for fpath in files:
    try:
        d = json.load(open(fpath, encoding='utf-8'))
        level = d.get('level', 'b1')
        story_id = d.get('id', os.path.basename(fpath))
        text_lines = d.get('text', [])

        if not text_lines:
            print(f"⚠️ {story_id}: text boş, atlandı")
            continue

        print(f"🔄 {level.upper()} / {story_id}...")

        # Vocab güncelle
        new_vocab = get_new_vocab(text_lines, level)
        if new_vocab:
            d['vocab'] = new_vocab
            total_vocab += len(new_vocab)
            print(f"  ✅ {len(new_vocab)} kelime")
        else:
            print(f"  ⚠️ Vocab güncellenemedi, mevcut korundu")

        # Hashtag güncelle
        d = update_hashtags(d)
        total_hashtag += len(d['hashtags'])
        print(f"  ✅ {len(d['hashtags'])} hashtag")

        open(fpath, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))
        time.sleep(2)

    except Exception as e:
        print(f"❌ {fpath}: {e}")

print(f"\n🏁 Tamamlandı!")
print(f"📊 Toplam {total_vocab} kelime, {total_hashtag} hashtag güncellendi")
