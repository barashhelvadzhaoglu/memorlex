"""
prompt_generator.py
--------------------
Kullanim:
  python3 ./scripts/de/prompt_generator.py a1
  python3 ./scripts/de/prompt_generator.py b2

  Dil (de/en/es) scriptin bulundugu klasorden otomatik alginir.
  scripts/de/ -> lang=de
  scripts/en/ -> lang=en
  scripts/es/ -> lang=es

Yaptigini:
  - Son 5 hikayenin ozetini okur
  - Taze karakter isimleri secer
  - Gemini web'e yapistirabilecegini tam bir prompt uretir
  - Prompt'u terminale yazdirir
  - ~/memorlex/stock/de/b2/prompt_b2.txt olarak kaydeder
  - Kaydedilecek JSON yolunu gosterir
"""

import json
import os
import re
import random
import sys
from typing import Optional

# ── Paths — lang klasorden otomatik algılanır ─────────────────────────────────
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))   # scripts/de/
LANG        = os.path.basename(SCRIPTS_DIR)                # "de", "en", "es"
PROJECT_DIR = os.path.dirname(os.path.dirname(SCRIPTS_DIR)) # ~/memorlex/
STOCK_BASE  = os.path.expanduser("~/memorlex/stock")

def stories_dir(level: str) -> str:
    return os.path.join(PROJECT_DIR, "src", "data", "stories", LANG, level)

def stock_dir(level: str) -> str:
    return os.path.join(STOCK_BASE, LANG, level)

# ── Config ─────────────────────────────────────────────────────────────────────
LEVEL_CONFIG = {
    "a1": {"scenes": 7,  "sentences": 2, "max_chars": 120,
           "desc": "Very simple short sentences. Basic needs, time, asking prices."},
    "a2": {"scenes": 10, "sentences": 2, "max_chars": 140,
           "desc": "Mix of Perfekt and Praesens. Daily life, simple dialogues."},
    "b1": {"scenes": 18, "sentences": 3, "max_chars": 260,
           "desc": "Subordinate clauses, modal verbs, formal texts. Medium sentences."},
    "b2": {"scenes": 24, "sentences": 4, "max_chars": 300,
           "desc": "Konjunktiv II, abstract topics, academic discussions."},
    "c1": {"scenes": 30, "sentences": 4, "max_chars": 340,
           "desc": "Academic analyses, philosophical perspectives, nominal style."},
}

EXAM_LOGIC = {
    "a1": "Short messages, simple form filling and basic shopping prices.",
    "a2": "Weather, station announcements, roadworks, restaurant and doctor appointments.",
    "b1": "Work life, environment, media, complaint management and official applications.",
    "b2": "Sustainability, globalisation, technological ethics and career planning.",
    "c1": "Sociological analyses, historical contexts, abstract concepts, academic terminology.",
}

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

TOPIC_POOL = {
    "de": [
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
    ],
    "en": [
        "Daily life: Navigating the London Underground at rush hour",
        "Weather: Planning a trip around UK bank holiday weather",
        "Work: Job interview at a British tech startup",
        "Housing: Understanding a UK rental contract",
        "Health: Registering with a GP in England",
        "Education: UCAS application process for university",
        "Finance: Opening a bank account as a new arrival",
        "Culture: Pub etiquette and British social customs",
        "Transport: Using Oyster card vs contactless in London",
        "Shopping: Comparing supermarket loyalty cards in the UK",
        "Environment: Recycling rules in British councils",
        "Technology: Smart home setup on a budget",
        "Travel: Booking a National Rail journey with split tickets",
        "Food: Reading a British restaurant menu and tipping culture",
        "Society: Volunteering and community events in the UK",
    ],
    "es": [
        "Cotidiano: Hacer la compra en el mercado de La Boqueria",
        "Transporte: Usar el metro de Madrid en hora punta",
        "Trabajo: Entrevista de trabajo en una empresa espanola",
        "Salud: Pedir cita en el centro de salud",
        "Vivienda: Entender un contrato de alquiler en Espana",
        "Educacion: Matricularse en un curso de formacion profesional",
        "Cultura: Las fiestas locales y tradiciones regionales",
        "Gastronomia: Pedir en un bar de tapas y pagar la cuenta",
        "Burocracia: Tramitar el empadronamiento en el ayuntamiento",
        "Medio ambiente: Separar residuos segun el municipio",
        "Tecnologia: Configurar el router de fibra optica en casa",
        "Finanzas: Abrir una cuenta bancaria como extranjero",
        "Ocio: Planificar un fin de semana en la Sierra de Guadarrama",
        "Sociedad: Voluntariado y asociaciones vecinales",
        "Historia: La Transicion espanola y la Constitucion de 1978",
    ],
}

LANG_NOTE = {
    "de": "Write the story in GERMAN. All text, vocab, and questions in German.",
    "en": "Write the story in ENGLISH. All text, vocab, and questions in English.",
    "es": "Write the story in SPANISH. All text, vocab, and questions in Spanish.",
}

CHARACTER_POOL = {
    "german":   ["Markus", "Petra", "Jochen", "Sabine", "Rainer", "Helga", "Dieter", "Ingrid",
                 "Florian", "Claudia", "Stefan", "Monika", "Wolfgang", "Brigitte", "Tobias", "Renate"],
    "turkish":  ["Ayse", "Mehmet", "Fatih", "Zeynep", "Burak", "Gulsen", "Emre", "Selin",
                 "Kerem", "Neslihan", "Murat", "Elif", "Haluk", "Derya", "Serkan", "Aysun"],
    "eastern":  ["Andriy", "Olena", "Dmytro", "Natalia", "Vasyl", "Iryna", "Viktor", "Oksana",
                 "Mykola", "Daryna", "Ivan", "Larysa"],
    "southern": ["Maria", "Giuseppe", "Fatima", "Hamid", "Yusuf", "Amina", "Dragan", "Milena",
                 "Bogdan", "Svetlana", "Tariq", "Laila"],
    "asian":    ["Mei", "Kenji", "Priya", "Arjun", "Ji-ho", "Minh", "Sakura", "Ravi",
                 "Hana", "Takashi", "Leila", "Chen"],
}


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_recent_summaries(level: str, count: int = 5) -> list:
    pub_dir = stories_dir(level)
    if not os.path.exists(pub_dir):
        return []
    files = sorted([f for f in os.listdir(pub_dir) if f.startswith("storie-") and f.endswith(".json")])
    result = []
    for fname in files[-count:]:
        try:
            with open(os.path.join(pub_dir, fname), encoding="utf-8") as f:
                data = json.load(f)
            result.append({
                "file":    fname,
                "title":   data.get("title", fname),
                "summary": data.get("summary", ""),
                "sample":  (data.get("text") or [""])[0][:150],
            })
        except Exception as e:
            print(f"[!] {fname} okunamadi: {e}")
    return result


def get_bridge_vocab(level: str, count: int = 10) -> list:
    pub_dir = stories_dir(level)
    if not os.path.exists(pub_dir):
        return []
    files = sorted([f for f in os.listdir(pub_dir) if f.startswith("storie-") and f.endswith(".json")])
    if not files:
        return []
    try:
        with open(os.path.join(pub_dir, files[-1]), encoding="utf-8") as f:
            data = json.load(f)
        vocab = data.get("vocab", [])
        sample = random.sample(vocab, min(count, len(vocab)))
        safe = []
        for v in sample:
            term = re.sub(r'^(der|die|das|ein|eine|the|a|an|el|la|los|las|un|una)\s+', '',
                          v.get("term", ""), flags=re.IGNORECASE)
            term = (term
                    .replace('\u00e4','ae').replace('\u00f6','oe').replace('\u00fc','ue')
                    .replace('\u00c4','Ae').replace('\u00d6','Oe').replace('\u00dc','Ue')
                    .replace('\u00df','ss').replace('"','').replace("'",'').replace('\n',' '))
            if term.strip():
                safe.append(term.strip())
        return safe
    except Exception as e:
        print(f"[!] Bridge vocab hatasi: {e}")
        return []


def pick_characters(recent_summaries: list) -> dict:
    used_text = " ".join(
        s.get("title","") + " " + s.get("summary","") + " " + s.get("sample","")
        for s in recent_summaries
    ).lower()

    groups = list(CHARACTER_POOL.keys())
    random.shuffle(groups)

    protagonist = None
    for name in random.sample(CHARACTER_POOL[groups[0]], len(CHARACTER_POOL[groups[0]])):
        if name.lower() not in used_text:
            protagonist = name
            break
    protagonist = protagonist or random.choice(CHARACTER_POOL[groups[0]])

    secondary = None
    for name in random.sample(CHARACTER_POOL[groups[1]], len(CHARACTER_POOL[groups[1]])):
        if name.lower() not in used_text and name != protagonist:
            secondary = name
            break
    secondary = secondary or random.choice(CHARACTER_POOL[groups[1]])

    return {"protagonist": protagonist, "secondary": secondary}


def get_next_story_number(level: str) -> int:
    """Yayınlanmış + stok klasörlerinin ikisine bakarak çakışmasız numara döner."""
    numbers = set()
    for directory in [stories_dir(level), stock_dir(level)]:
        if not os.path.exists(directory):
            continue
        for f in os.listdir(directory):
            m = re.search(r"storie-(\d+)\.json", f)
            if m:
                numbers.add(int(m.group(1)))
    return (max(numbers) + 1) if numbers else 1


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(f"Kullanim: python3 ./scripts/{LANG}/prompt_generator.py <level>")
        print(f"Ornek:    python3 ./scripts/{LANG}/prompt_generator.py b2")
        print(f"Gecerli seviyeler: a1 a2 b1 b2 c1")
        sys.exit(1)

    level = sys.argv[1].lower().strip()

    if LANG not in TOPIC_POOL:
        print(f"[!] Tanimsiz dil klasoru: '{LANG}'. Beklenen: de, en, es")
        sys.exit(1)

    if level not in LEVEL_CONFIG:
        print(f"[!] Gecersiz seviye: '{level}'. Gecerli: a1 a2 b1 b2 c1")
        sys.exit(1)

    cfg        = LEVEL_CONFIG[level]
    stk_dir    = stock_dir(level)
    topics     = random.sample(TOPIC_POOL[LANG], 2)
    recent     = get_recent_summaries(level, count=5)
    bridge     = get_bridge_vocab(level, count=10)
    characters = pick_characters(recent)
    next_num   = get_next_story_number(level)
    story_id   = f"storie-{next_num:03d}"

    recent_block = (
        "RECENT STORIES (last 5 — new story must be COMPLETELY DIFFERENT):\n" +
        "\n".join(f"  - [{s['file']}] \"{s['title']}\": {s['summary']}" for s in recent)
    ) if recent else "RECENT STORIES: none (first story)."

    bridge_block = (
        f"BRIDGE WORDS (use in scenes, do NOT add to vocab): {bridge}"
        if bridge else "BRIDGE WORDS: none."
    )

    char_block = (
        f"REQUIRED CHARACTERS:\n"
        f"  - Protagonist: {characters['protagonist']}\n"
        f"  - Secondary: {characters['secondary']}\n"
        f"Use ONLY these names. Do NOT use Anna, Thomas, Lukas, Sophie or any name from recent stories."
    )

    prompt = f"""You are a language exam expert. Generate a {level.upper()} level German video story.

LANGUAGE: {LANG_NOTE[LANG]}
TOPICS: Blend these two topics: {topics}
SCENES: Exactly {cfg['scenes']} elements in the "text" array
SCENE LENGTH: Max {cfg['sentences']} sentences, max {cfg['max_chars']} characters per scene
LEVEL: {cfg['desc']}
EXAM DATA: Include specific times, prices, dates, platform/gate numbers
EXAM STRATEGY: {EXAM_LOGIC[level]}
VOCAB: 15-20 new words. {bridge_block}
VOCAB SELECTION: {VOCAB_RULES[level]["instruction"]}
VOCAB AVOID: {VOCAB_RULES[level]["avoid"]}
VOCAB NOUNS: Every noun MUST have its article
QUESTIONS: 8-10 multiple choice, at least half testing specific data
IMAGE PROMPTS: Exactly {cfg['scenes']} English Stable Diffusion prompts

CHARACTER & DIVERSITY RULES:
{char_block}

{recent_block}

CRITICAL JSON RULES — violations will cause a crash:
1. Output ONLY raw JSON — no markdown, no backticks, no text before or after
2. Use DOUBLE QUOTES for all keys and string values
3. NEVER use quote characters inside string values — rephrase to avoid them
4. Write dialogue as INDIRECT SPEECH only, never with quotation marks
5. Leave "hashtags" as an empty array: []
6. NO real newlines inside strings — use \\n
7. ALL special characters as ASCII where possible
8. Complete JSON must fit in one response without being cut off

Exact output structure:
{{
  "id": "{story_id}",
  "lang": "{LANG}",
  "level": "{level}",
  "youtubeId": "",
  "title": "Story title (ASCII only)",
  "summary": "Two sentence summary (ASCII only).",
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

    # ── Çıktı ─────────────────────────────────────────────────────────────────
    os.makedirs(stk_dir, exist_ok=True)

    print("\n" + "="*70)
    print(f"  GEMINI PROMPT — {LANG.upper()} / {level.upper()} — {story_id}")
    print("="*70)
    print(prompt)
    print("="*70)

    # Prompt'u stok klasörüne kaydet
    prompt_file = os.path.join(stk_dir, f"prompt_{level}.txt")
    with open(prompt_file, "w", encoding="utf-8") as f:
        f.write(prompt)

    save_path = os.path.join(stk_dir, f"{story_id}.json")

    print(f"\n✅ Dil   : {LANG.upper()}")
    print(f"✅ Seviye: {level.upper()}")
    print(f"✅ Prompt kaydedildi: {prompt_file}")
    print(f"\n📋 Adimlar:")
    print(f"   1. Prompt'u kopyala")
    print(f"   2. https://gemini.google.com → yapistir → gonder")
    print(f"   3. JSON cevabini kaydet:")
    print(f"      {save_path}")


if __name__ == "__main__":
    main()