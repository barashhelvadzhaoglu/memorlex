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
    print(f"❌ Modül import hatası: {e}")
    print("Lütfen tüm scriptlerin aynı klasörde olduğundan emin olun.")
    sys.exit(1)

ALL_LEVELS = ["a1", "a2", "b1", "b2", "c1"]



def send_imessage(message: str):
    import subprocess
    script = f'''tell application "Messages"
      set targetService to 1st service whose service type = iMessage
      set targetBuddy to buddy "baris.helvacioglu@outlook.com" of targetService
      send "{message}" to targetBuddy
    end tell'''
    try:
        subprocess.run(["osascript", "-e", script], check=True)
    except Exception as e:
        print(f"⚠️ iMessage gönderilemedi: {e}")

def git_push(message):
    try:
        print("\n🌐 GitHub'a push ediliyor...")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", message], check=True)
        subprocess.run(["git", "push", "origin", "main"], check=True)
        print("✅ Push tamamlandı.")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git Hatası: {e}")
    except Exception as e:
        print(f"❌ Git Hatası: {e}")


def run_single(level: str, index: int, total: int) -> bool:
    print(f"\n{'='*50}")
    print(f"📦 {index}/{total} — Seviye: {level.upper()}")
    print(f"{'='*50}")

    try:
        # Adim 1: Hikaye uret
        print("Step 1: Hikaye üretiliyor...")
        generate_story(level_override=level)

        target_dir = os.path.join("src", "data", "stories", "de", level)
        json_files = [
            os.path.join(target_dir, f)
            for f in os.listdir(target_dir)
            if f.endswith(".json")
        ]
        if not json_files:
            raise FileNotFoundError(f"Hiç JSON bulunamadı: {target_dir}")
        latest_json = max(json_files, key=os.path.getmtime)
        story_id = os.path.basename(latest_json).replace(".json", "")
        print(f"✅ JSON: {latest_json}")

        # Adim 2: Video uret
        print("\nStep 2: Video oluşturuluyor...")
        create_storybook(latest_json, level=level)

        video_path = os.path.join("temp", f"{level}-{story_id}.mp4")
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video bulunamadı: {video_path}")
        print(f"✅ Video: {video_path}")

        # Adim 3: YouTube
        print("\nStep 3: YouTube'a yükleniyor...")
        video_id = upload_video(video_path, latest_json)
        if not video_id:
            raise Exception("YouTube ID alınamadı.")

        # Adim 4: GitHub
        print("\nStep 4: GitHub'a yedekleniyor...")
        git_push(f"Auto [{level.upper()}]: {story_id} — YouTube: {video_id}")

        print(f"\n✅ {level.upper()} tamamlandı! 📺 https://youtu.be/{video_id}")
        return True

    except Exception as e:
        print(f"\n❌ {level.upper()} HATA: {str(e)}")
        traceback.print_exc()
        return False


def run_pipeline(level_override: Optional[str] = None, count: int = 1):
    """
    Kullanim:
      python master_run.py              → her seviyeden 1 hikaye (a1 a2 b1 b2 c1)
      python master_run.py b1           → sadece B1, 1 hikaye
      python master_run.py b1 5         → sadece B1, 5 hikaye
    """
    start_time = datetime.now()
    print(f"\n🚀 Memorlex Pipeline: {start_time.strftime('%d/%m/%Y %H:%M:%S')}")

    # Hangi seviyeleri calistir?
    if level_override:
        levels_to_run = [level_override] * count
    else:
        # Her seviyeden 1'er tane — toplam 5
        levels_to_run = ALL_LEVELS

    print(f"📋 Sıra: {' → '.join(l.upper() for l in levels_to_run)}")

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
            print(f"\n⏳ {wait} saniye bekleniyor...")
            time.sleep(wait)

    print(f"\n{'='*50}")
    print(f"🏁 TAMAMLANDI — ✅ {success} başarılı / ❌ {fail} başarısız")
    print(f"⏱️ Toplam: {datetime.now() - start_time}")
    print(f"{'='*50}")

    # iMessage bildirimi
    msg = f"Memorlex Pipeline\nA1: {chr(9989) if success >= 1 else chr(10060)}\nA2: {chr(9989) if success >= 2 else chr(10060)}\n\n{success}/5 basarili\n{datetime.now() - start_time}"
    send_imessage(msg)



if __name__ == "__main__":
    level_arg = sys.argv[1] if len(sys.argv) > 1 else None
    count_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    run_pipeline(level_override=level_arg, count=count_arg)