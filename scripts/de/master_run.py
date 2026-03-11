import os
import sys
import time
import traceback
import subprocess
from datetime import datetime
from typing import Optional

try:
    from generate_story import generate_story, get_current_level
    from create_storybook import create_storybook
    from upload_youtube import upload_video
except ImportError as e:
    print(f"Modul import hatasi: {e}")
    print("Lutfen tum scriptlerin ayni klasorde oldugunu kontrol edin.")
    sys.exit(1)

ALL_LEVELS = ["a1", "a2", "b1", "b2", "c1"]


def send_imessage(message: str):
    import subprocess, time
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


def run_single(level: str, index: int, total: int) -> bool:
    print(f"\n{'='*50}")
    print(f"Paket {index}/{total} -- Seviye: {level.upper()}")
    print(f"{'='*50}")

    try:
        # Adim 1: Hikaye uret
        print("Step 1: Hikaye uretiliyor...")
        new_json_path = generate_story(level_override=level)

        # ── KRITIK: generate_story basarisiz olduysa dur ──────────────────
        if not new_json_path:
            raise RuntimeError(
                f"generate_story() basarisiz oldu — yeni JSON uretilmedi. "
                f"Eski dosya kullanilmayacak."
            )
        # ──────────────────────────────────────────────────────────────────

        if not os.path.exists(new_json_path):
            raise FileNotFoundError(f"JSON dosyasi yok: {new_json_path}")

        story_id = os.path.basename(new_json_path).replace(".json", "")
        print(f"JSON: {new_json_path}")

        # Adim 2: Video uret
        print("\nStep 2: Video olusturuluyor...")
        create_storybook(new_json_path, level=level)

        video_path = os.path.join("temp", f"{level}-{story_id}.mp4")
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video bulunamadi: {video_path}")
        print(f"Video: {video_path}")

        # Adim 3: YouTube
        print("\nStep 3: YouTube'a yukleniyor...")
        video_id = upload_video(video_path, new_json_path)
        if not video_id:
            raise Exception("YouTube ID alinamadi.")

        # Adim 4: GitHub
        print("\nStep 4: GitHub'a yedekleniyor...")
        git_push(f"Auto [{level.upper()}]: {story_id} -- YouTube: {video_id}")

        print(f"\n{level.upper()} tamamlandi! https://youtu.be/{video_id}")
        return True

    except Exception as e:
        print(f"\n{level.upper()} HATA: {str(e)}")
        traceback.print_exc()
        return False


def run_pipeline(level_override: Optional[str] = None, count: int = 1):
    """
    Kullanim:
      python master_run.py              -> her seviyeden 1 hikaye (a1 a2 b1 b2 c1)
      python master_run.py b1           -> sadece B1, 1 hikaye
      python master_run.py b1 5         -> sadece B1, 5 hikaye
    """
    start_time = datetime.now()
    print(f"\nMemorlex Pipeline: {start_time.strftime('%d/%m/%Y %H:%M:%S')}")

    if level_override:
        levels_to_run = [level_override] * count
    else:
        levels_to_run = ALL_LEVELS

    print(f"Sira: {' -> '.join(l.upper() for l in levels_to_run)}")

    success = 0
    fail    = 0

    for i, level in enumerate(levels_to_run, 1):
        ok = run_single(level, i, len(levels_to_run))
        if ok:
            success += 1
        else:
            fail += 1

        if i < len(levels_to_run):
            wait = 30 if ok else 60
            print(f"\n{wait} saniye bekleniyor...")
            time.sleep(wait)

    print(f"\n{'='*50}")
    print(f"TAMAMLANDI -- {success} basarili / {fail} basarisiz")
    print(f"Toplam: {datetime.now() - start_time}")
    print(f"{'='*50}")

    msg = f"Memorlex Pipeline\n{success}/{len(levels_to_run)} basarili\n{datetime.now() - start_time}"
    send_imessage(msg)


if __name__ == "__main__":
    level_arg = sys.argv[1] if len(sys.argv) > 1 else None
    count_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    run_pipeline(level_override=level_arg, count=count_arg)