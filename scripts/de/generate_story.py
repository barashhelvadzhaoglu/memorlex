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
    "gemini-2.0-flash",
]

WEEKLY_SCHEDULE = {
    0: "a1", 1: "a2", 2: "b1", 3: "b2", 4: "c1", 5: None, 6: None,
}

LEVEL_CONFIG = {
    # max_tokens bumped up for all levels to prevent truncation
    "a1": {"scenes": 7,  "sentences": 2, "max_chars": 120, "max_tokens": 8192,
           "desc": "Very simple short sentences. Basic needs, time, asking prices."},
    "a2": {"scenes": 10, "sentences": 2, "max_chars": 140, "max_tokens": 8192,
           "desc": "Mix of Perfekt and Praesens. Daily life, simple dialogues."},
    "b1": {"scenes": 18, "sentences": 3, "max_chars": 260, "max_tokens": 16384,
           "desc": "Subordinate clauses, modal verbs, formal texts. Medium sentences."},
    "b2": {"scenes": 24, "sentences": 4, "max_chars": 300, "max_tokens": 16384,
           "desc": "Konjunktiv II, abstract topics, academic discussions."},
    "c1": {"scenes": 30, "sentences": 4, "max_chars": 340, "max_tokens": 16384,
           "desc": "Academic analyses, philosophical perspectives, nominal style."},
}

EXAM_LOGIC = {
    "a1": "Short messages, simple form filling and basic shopping prices.",
    "a2": "Weather, station announcements, roadworks, restaurant and doctor appointments.",
    "b1": "Work life, environment, media, complaint management and official applications.",
    "b2": "Sustainability, globalisation, technological ethics and career planning.",
    "c1": "Sociological analyses, historical contexts, abstract concepts, academic terminology.",
}

TOPIC_POOL = [
    "Alltag: Oktoberfest Muenchen mit Budgetplanung",
    "Wetter: Wintereinbruch in Bayern, Folgen fuer die Bahn",
    "Verkehr: Baustellen A99, Umleitungen fuer Pendler",
    "Einkauf: Preisvergleich Discounter vs. Biomarkt",
    "Gesundheit: Apotheken-Notdienst nachts finden",
    "Wohnen: Muelltrennung-Anleitung fuer neue Mieter",
    "Freizeit: Wochenendausflug Allianz Arena planen",
    "Kommunikation: Durchsage Flughafen Gate-Wechsel",
    "Beruf: Vorstellungsgespraech bei deutschem Mittelstaendler",
    "Bildung: Duales Studium - Praxis und Theorie",
    "Buerokratie: Kindergeld beantragen, Formulare verstehen",
    "Umwelt: Solarpflicht fuer Neubauten in Deutschland",
    "Technik: Industrie 4.0 - Roboter in der Autoproduktion",
    "Wirtschaft: Handwerk in Deutschland - goldener Boden",
    "Digitalisierung: Bargeldlose Zahlung vs. Bargeld-Kultur",
    "Geschichte: 35 Jahre Deutsche Einheit",
    "Kultur: Vereinsleben und Integration in Deutschland",
    "Wissenschaft: Quantencomputing am Max-Planck-Institut",
    "Philosophie: Ethik der KI im deutschen Recht",
    "Architektur: Vom Bauhaus zum Passivhaus-Standard",
    "Soziologie: Demografischer Wandel und Rente",
    "Politik: Das foederale System in Deutschland",
    "Umwelt: Energiewende ohne Atomkraft - machbar?",
    "Psychologie: Work-Life-Balance in der deutschen Arbeitskultur",
    "Transport: Autobahn-Geschichte, Deutschlandticket, Fahrradstaedte",
    "Staedte: Hamburgs Speicherstadt, Ruhrgebiet Industriekultur",
    "Wissenschaft: Deutsche Erfinder - Gutenberg, Benz, Einstein",
]

VOCAB_RULES = {
    "a1": {
        "instruction": "Choose words necessary in daily life but unusual for beginners. Example: Quittung, Warteschlange, Fahrkartenautomat, Pfand",
        "avoid": "Avoid very basic words like sein, haben, gut, gross, Tag, Mann, Frau, Kind, Haus, Auto",
    },
    "a2": {
        "instruction": "Choose words important for daily communication but requiring dictionary lookup. Example: Kassenbon, Ueberweisung, Termin absagen, Krankschreibung",
        "avoid": "Avoid A1-level basic words",
    },
    "b1": {
        "instruction": "Choose mid-advanced, abstract or formal words. Example: Beeintraechtigung, Zustaendigkeit, Genehmigung, Nachhaltigkeit",
        "avoid": "Avoid very common and simple verbs",
    },
    "b2": {
        "instruction": "Choose academic, abstract, multi-meaning words. Example: Ambivalenz, Paradigmenwechsel, Restrukturierung, Beeinflussbarkeit",
        "avoid": "Avoid B1 and below words",
    },
    "c1": {
        "instruction": "Choose rare, academic, philosophical or technical words. Example: Interdependenz, Praezedenzfall, Konnotation, Diskrepanz, Reziprozitaet",
        "avoid": "Avoid B2 and below words",
    },
}

HASHTAGS = [
    "#DeutschLernen", "#LearnGerman", "#Deutsch", "#GermanLanguage",
    "#DeutschKurs", "#DeutschAlsFremdsprache", "#DAF",
    "#Lesen", "#Hoeren", "#Leseverstehen", "#Hoerverstehen",
    "#GoetheZertifikat", "#Telc", "#TestDaF", "#DSH",
    "#Deutschkenntnisse", "#DeutschOnline", "#DeutschUeben",
    "#Sprachkurs", "#Sprachenlernen", "#Mehrsprachig",
    "#DeutschFuerAnfaenger", "#DeutschFuerFortgeschrittene",
    "#Vokabeln", "#Grammatik", "#DeutschSprechen",
    "#Integrationskurs", "#Germany", "#Deutschland", "#Berlin", "#Muenchen",
    "#Memorlex", "#LanguageLearning", "#Flashcards",
]


def get_current_level(override: Optional[str] = None) -> Optional[str]:
    if override:
        lvl = override.lower().strip()
        if lvl in LEVEL_CONFIG:
            return lvl
        print(f"Invalid level: '{override}'. Valid: a1 a2 b1 b2 c1")
        return None
    return WEEKLY_SCHEDULE.get(datetime.now().weekday())


def get_next_filename(directory: str) -> str:
    os.makedirs(directory, exist_ok=True)
    numbers = set()
    for f in os.listdir(directory):
        m = re.search(r"storie-(\d+)\.json", f)
        if m:
            numbers.add(int(m.group(1)))
    next_n = max(numbers) + 1 if numbers else 1
    filename = f"storie-{next_n:03d}.json"
    print(f"[get_next_filename] existing={sorted(numbers)} -> new={filename}")
    return filename


def get_previous_story_vocab(save_dir: str, count: int = 10) -> list:
    if not os.path.exists(save_dir):
        return []
    json_files = sorted([
        f for f in os.listdir(save_dir)
        if f.startswith("storie-") and f.endswith(".json")
    ])
    if not json_files:
        return []
    try:
        with open(os.path.join(save_dir, json_files[-1]), "r", encoding="utf-8") as f:
            data = json.load(f)
        vocab = data.get("vocab", [])
        sample = random.sample(vocab, min(count, len(vocab)))
        safe = []
        for v in sample:
            term = v.get("term", "")
            term = re.sub(r'^(der|die|das|ein|eine)\s+', '', term, flags=re.IGNORECASE)
            term = (term
                    .replace('\u00e4', 'ae').replace('\u00f6', 'oe').replace('\u00fc', 'ue')
                    .replace('\u00c4', 'Ae').replace('\u00d6', 'Oe').replace('\u00dc', 'Ue')
                    .replace('\u00df', 'ss')
                    .replace('"', '').replace("'", '').replace('\n', ' '))
            if term.strip():
                safe.append(term.strip())
        print(f"[bridge_vocab] {len(safe)} words: {safe}")
        return safe
    except Exception as e:
        print(f"[bridge_vocab] error: {e}")
        return []


def call_gemini(prompt: str, api_key: str, model_name: str, max_tokens: int) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": max_tokens},
    }
    response = requests.post(url, json=payload, timeout=120)
    response.raise_for_status()
    return response.json()['candidates'][0]['content']['parts'][0]['text']


def parse_json_safe(raw_text: str) -> dict:
    """
    Robustly extract and parse JSON from Gemini response.
    Handles: markdown fences, single-quote JSON, unescaped newlines,
    inner double-quotes inside string values.
    """
    text = raw_text.strip()

    # 1. Strip markdown fences
    if "```" in text:
        for part in text.split("```"):
            part = part.strip().lstrip("json").lstrip("JSON").strip()
            if part.startswith("{"):
                text = part
                break

    # 2. Extract outermost { }
    start = text.find("{")
    end   = text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]

    # 3. Normalize unicode quotes
    text = (text
            .replace('\u201e', '"').replace('\u201c', '"').replace('\u201d', '"')
            .replace('\u2018', "'").replace('\u2019', "'")
            .replace('\r\n', '\\n').replace('\r', '\\n'))

    # 4. Standard parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 5. Gemini returned Python-style single-quote dict
    try:
        import ast
        data = ast.literal_eval(text)
        if isinstance(data, dict):
            print("[parse] recovered via ast.literal_eval")
            return data
    except Exception:
        pass

    # 6. Fix unescaped real newlines inside strings
    def escape_newlines(m):
        return m.group(0).replace('\n', '\\n').replace('\t', '\\t')

    text_nl = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', escape_newlines, text, flags=re.DOTALL)
    try:
        return json.loads(text_nl)
    except json.JSONDecodeError:
        pass

    # 7. Fix unescaped double-quotes inside string values (char-by-char)
    def fix_inner_double_quotes(s):
        result = []
        in_string = False
        i = 0
        while i < len(s):
            c = s[i]
            if c == '\\' and in_string:
                result.append(c)
                i += 1
                if i < len(s):
                    result.append(s[i])
                i += 1
                continue
            if c == '"':
                if not in_string:
                    in_string = True
                    result.append(c)
                else:
                    j = i + 1
                    while j < len(s) and s[j] == ' ':
                        j += 1
                    next_c = s[j] if j < len(s) else ''
                    if next_c in (',', '}', ']', ':'):
                        in_string = False
                        result.append(c)
                    else:
                        result.append('\\"')
                i += 1
                continue
            result.append(c)
            i += 1
        return ''.join(result)

    text_fixed = fix_inner_double_quotes(text_nl)
    try:
        return json.loads(text_fixed)
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(f"All parse attempts failed: {e.msg}", e.doc, e.pos)


def generate_story(level_override: Optional[str] = None) -> Optional[str]:
    """
    Generates a new story and returns the saved file path.
    Returns None on failure — caller must check!
    """
    if not API_KEYS:
        print("ERROR: No API key found.")
        return None

    level = get_current_level(level_override)
    if level is None:
        print("Weekend — no story generated.")
        return None

    cfg      = LEVEL_CONFIG[level]
    topics   = random.sample(TOPIC_POOL, 2)
    save_dir = os.path.join("src", "data", "stories", "de", level)

    bridge_words = get_previous_story_vocab(save_dir, count=10)
    if bridge_words:
        bridge_block = f"BRIDGE WORDS (use in scenes, do NOT add to vocab): {bridge_words}"
    else:
        bridge_block = "BRIDGE WORDS: none (first story)."

    prompt = f"""You are a Goethe/Telc exam expert. Generate a {level.upper()} level German video story.

STRICT RULES:
- TOPICS: Blend these two topics: {topics}
- SCENES: Exactly {cfg['scenes']} elements in the "text" array
- SCENE LENGTH: Max {cfg['sentences']} sentences, max {cfg['max_chars']} characters per scene
- LEVEL: {cfg['desc']}
- EXAM DATA: Include specific times, prices, dates, platform/gate numbers
- EXAM STRATEGY: {EXAM_LOGIC[level]}
- VOCAB: 15-20 new German words. {bridge_block}
- VOCAB SELECTION: {VOCAB_RULES[level]["instruction"]}
- VOCAB AVOID: {VOCAB_RULES[level]["avoid"]}
- VOCAB NOUNS: Every noun MUST have its article: "das Haus", "der Mann", "die Frau"
- QUESTIONS: 8-10 multiple choice, at least half testing specific data
- IMAGE PROMPTS: Exactly {cfg['scenes']} English Stable Diffusion prompts

CRITICAL JSON RULES — violations will cause a crash:
1. Output ONLY raw JSON — no markdown, no backticks, no text before or after the JSON
2. Use DOUBLE QUOTES for all JSON keys and string values
3. NEVER use any quote characters inside string values — rephrase sentences to avoid them
4. Write dialogue as INDIRECT SPEECH only, never with quotation marks
   BAD:  "Eine Ansage kommt: 'Flug LH123 ist verspaetet.'"
   GOOD: "Eine Ansage informiert, dass Flug LH123 verspaetet ist."
5. Leave "hashtags" as an empty array: []  — do not fill it in
6. NO real newlines inside strings — use backslash + n
7. ALL German umlauts as ASCII: ae oe ue Ae Oe Ue ss
8. The complete JSON must fit in one response without being cut off

Exact output structure (copy this exactly, only fill in the values):
{{
  "id": "storie-001",
  "level": "{level}",
  "youtubeId": "",
  "title": "Story title in German (ASCII only)",
  "summary": "Two sentence summary in German (ASCII only).",
  "hashtags": [],
  "text": ["scene 1 text", "scene 2 text"],
  "image_prompts": ["realistic photo, scene 1, cinematic lighting", "scene 2 prompt"],
  "vocab": [
    {{"term": "die Quittung", "type": "Nomen", "meaning_tr": "fis", "meaning_en": "receipt", "meaning_es": "recibo", "meaning_uk": "kvytantsiia", "example": "Ich brauche eine Quittung."}}
  ],
  "questions": [
    {{"question": "Question?", "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"], "answer": "A) opt1"}}
  ]
}}"""

    for api_key in API_KEYS:
        for model_name in MODELS_TO_TRY:
            for attempt in range(1, 4):
                try:
                    print(f"Trying: {model_name} | key={api_key[:12]}... | attempt {attempt}/3")
                    raw = call_gemini(prompt, api_key, model_name, cfg['max_tokens'])
                    print(f"[raw preview] {repr(raw[:400])}")

                    data = parse_json_safe(raw)
                    print(f"Parsed OK — scenes:{len(data.get('text',[]))} vocab:{len(data.get('vocab',[]))} q:{len(data.get('questions',[]))}")

                    file_name = get_next_filename(save_dir)
                    file_path = os.path.join(save_dir, file_name)
                    data["id"]       = file_name.replace(".json", "")
                    data["level"]    = level
                    data["hashtags"] = HASHTAGS

                    with open(file_path, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)

                    print(f"SUCCESS: {file_path}")
                    return file_path

                except requests.exceptions.HTTPError as e:
                    status = e.response.status_code if e.response else "?"
                    body   = e.response.text[:200] if e.response else ""
                    print(f"HTTP {status} — {model_name}: {body}")
                    time.sleep(2)
                    break

                except requests.exceptions.Timeout:
                    print(f"Timeout — {model_name} attempt {attempt}/3")
                    time.sleep(5)

                except (json.JSONDecodeError, KeyError) as e:
                    print(f"JSON parse error ({model_name} attempt {attempt}/3): {e}")
                    if attempt < 3:
                        time.sleep(5)

                except Exception as e:
                    print(f"Error ({model_name}): {type(e).__name__}: {e}")
                    time.sleep(2)
                    break

    print("FAILED: all keys and models exhausted.")
    return None


if __name__ == "__main__":
    import sys
    result = generate_story(level_override=sys.argv[1] if len(sys.argv) > 1 else None)
    sys.exit(0 if result else 1)