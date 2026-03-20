import os
import sys
import json
import re
import time
import traceback
import subprocess
from datetime import datetime
from typing import Optional

try:
    from create_storybook import create_storybook
    from upload_youtube import upload_video
except ImportError as e:
    print(f"Modul import hatasi: {e}")
    print("Lutfen tum scriptlerin ayni klasorde oldugunu kontrol edin.")
    sys.exit(1)

ALL_LEVELS = ["a1", "a2", "b1", "b2", "c1"]

SCRIPTS_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR  = os.path.dirname(os.path.dirname(SCRIPTS_DIR))
STOCK_BASE   = os.path.expanduser("~/memorlex/stock")

def stories_dir(lang: str, level: str) -> str:
    return os.path.join(PROJECT_DIR, "src", "data", "stories", lang, level)

def stock_dir(lang: str, level: str) -> str:
    return os.path.join(STOCK_BASE, lang, level)


def send_imessage(message: str):
    subprocess.run(["open", "-a", "Messages"], check=False)
    time.sleep(3)
    script = f'''tell application "Messages"
      set targetService to 1st service whose service type = iMessage
      set targetBuddy to buddy "baris.helvacioglu@outlook.com" of targetService
      send "{message}" to targetBuddy
    end tell'''
    try:
        subprocess.run(["osascript", "-e", script], check=True)
    except Exception as e:
        print(f"iMessage gonderilemedi: {e}")


def git_push(message):
    try:
        print("\nGitHub'a push ediliyor...")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", message], check=True)
        subprocess.run(["git", "push", "origin", "main"], check=True)
        print("Push tamamlandi.")
    except subprocess.CalledProcessError as e:
        print(f"Git Hatasi: {e}")
    except Exception as e:
        print(f"Git Hatasi: {e}")


def get_next_stock_json(lang: str, level: str) -> Optional[str]:
    """
    ~/memorlex/stock/{lang}/{level}/ klasöründen en eski JSON'ı alır,
    src/data/stories/{lang}/{level}/ klasörüne taşır (numara çakışmasız).
    Stok boşsa None döner.
    """
    stk_dir    = stock_dir(lang, level)
    target_dir = stories_dir(lang, level)
    os.makedirs(target_dir, exist_ok=True)

    if not os.path.exists(stk_dir):
        return None

    files = sorted([
        f for f in os.listdir(stk_dir)
        if f.startswith("storie-") and f.endswith(".json")
    ])

    if not files:
        return None

    src_path = os.path.join(stk_dir, files[0])

    # Çakışmasız hedef numara
    existing = set()
    for f in os.listdir(target_dir):
        m = re.search(r"storie-(\d+)\.json", f)
        if m:
            existing.add(int(m.group(1)))
    next_n   = (max(existing) + 1) if existing else 1
    new_name = f"storie-{next_n:03d}.json"
    dst_path = os.path.join(target_dir, new_name)

    # JSON içindeki id'yi güncelle ve hedefe yaz
    with open(src_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["id"]   = new_name.replace(".json", "")
    data["lang"] = lang
    with open(dst_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    os.remove(src_path)

    remaining = len([f for f in os.listdir(stk_dir) if f.endswith(".json")])
    print(f"  📦 Stoktan alindi: {files[0]} → {new_name}  (stokta kalan: {remaining})")

    if remaining <= 2:
        send_imessage(
            f"⚠️ Memorlex stok azaliyor!\n"
            f"{lang.upper()} / {level.upper()} icin yalnizca {remaining} hikaye kaldi.\n"
            f"python3 prompt_generator.py {lang} {level}"
        )

    return dst_path


def run_single(lang: str, level: str, index: int, total: int) -> bool:
    print(f"\n{'='*50}")
    print(f"Paket {index}/{total} -- {lang.upper()} / {level.upper()}")
    print(f"{'='*50}")

    try:
        print("Step 1: Stoktan JSON aliniyor...")
        json_path = get_next_stock_json(lang, level)

        if not json_path:
            print(f"\n⚠️  {lang.upper()}/{level.upper()} stogu bos — bu seviye atlandi.")
            return False

        story_id = os.path.basename(json_path).replace(".json", "")
        print(f"JSON: {json_path}")

        print("\nStep 2: Video olusturuluyor...")
        create_storybook(json_path, level=level)

        video_path = os.path.join("temp", f"{level}-{story_id}.mp4")
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video bulunamadi: {video_path}")
        print(f"Video: {video_path}")

        print("\nStep 3: YouTube'a yukleniyor...")
        video_id = upload_video(video_path, json_path)
        if not video_id:
            raise Exception("YouTube ID alinamadi.")

        print("\nStep 4: GitHub'a yedekleniyor...")
        git_push(f"Auto [{lang.upper()}/{level.upper()}]: {story_id} -- YouTube: {video_id}")

        print(f"\n{lang.upper()}/{level.upper()} tamamlandi! https://youtu.be/{video_id}")
        return True

    except Exception as e:
        print(f"\n{lang.upper()}/{level.upper()} HATA: {str(e)}")
        traceback.print_exc()
        return False


def check_stock_status(langs: list):
    """Tüm dil ve seviyelerin stok durumunu özetler."""
    print("\n📦 Stok durumu:")
    for lang in langs:
        print(f"\n  [{lang.upper()}]")
        for level in ALL_LEVELS:
            stk = stock_dir(lang, level)
            count = len([f for f in os.listdir(stk) if f.endswith(".json")]) if os.path.exists(stk) else 0
            icon  = "✅" if count > 2 else ("⚠️ " if count > 0 else "❌")
            print(f"    {level.upper()}: {count} hikaye  {icon}")
    print(f"\n  Stok klasoru: {STOCK_BASE}")
    print()


def run_pipeline(lang: str = "de", level_override: Optional[str] = None, count: int = 1):
    """
    Kullanim:
      python master_run.py                    -> de, her seviyeden 1 hikaye
      python master_run.py de b1              -> de/B1, stoktan 1 hikaye
      python master_run.py de b1 3            -> de/B1, stoktan 3 hikaye
      python master_run.py --stock            -> tum dillerin stok durumu
      python master_run.py --stock de en      -> belirtilen dillerin stok durumu
    """
    start_time = datetime.now()
    print(f"\nMemorlex Pipeline: {start_time.strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"📌 Dil: {lang.upper()} | Mod: Stok tabanli (API kullanilmiyor)")

    check_stock_status([lang])

    if level_override:
        levels_to_run = [level_override] * count
    else:
        levels_to_run = ALL_LEVELS

    print(f"Sira: {' -> '.join(l.upper() for l in levels_to_run)}")

    success = 0
    fail    = 0

    for i, level in enumerate(levels_to_run, 1):
        ok = run_single(lang, level, i, len(levels_to_run))
        if ok:
            success += 1
        else:
            fail += 1

        if i < len(levels_to_run):
            wait = 30 if ok else 10
            print(f"\n{wait} saniye bekleniyor...")
            time.sleep(wait)

    elapsed = datetime.now() - start_time
    print(f"\n{'='*50}")
    print(f"TAMAMLANDI -- {success} basarili / {fail} basarisiz")
    print(f"Toplam: {elapsed}")
    print(f"{'='*50}")

    msg = f"Memorlex Pipeline [{lang.upper()}]\n{success}/{len(levels_to_run)} basarili\n{elapsed}"
    send_imessage(msg)


if __name__ == "__main__":
    args = sys.argv[1:]

    # --stock kontrolu
    if args and args[0] == "--stock":
        langs = args[1:] if len(args) > 1 else ["de"]
        check_stock_status(langs)
        sys.exit(0)

    # Normal calisma: [lang] [level] [count]
    lang_arg  = args[0] if len(args) > 0 else "de"
    level_arg = args[1] if len(args) > 1 else None
    count_arg = int(args[2]) if len(args) > 2 else 1

    run_pipeline(lang=lang_arg, level_override=level_arg, count=count_arg)