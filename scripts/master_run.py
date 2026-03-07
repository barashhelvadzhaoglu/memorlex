import os
import sys
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


def git_push(message):
    try:
        print("\n🌐 GitHub Güncellemesi Başlatılıyor...")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", message], check=True)
        subprocess.run(["git", "push", "origin", "main"], check=True)
        print("✅ GitHub'a push edildi.")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git Hatası: {e}")
    except Exception as e:
        print(f"❌ Beklenmedik Git Hatası: {e}")


def run_single(current_level: str, index: int, total: int) -> bool:
    """Tek bir hikaye icin tam pipeline calistirir. Basarili ise True doner."""
    print(f"\n{'='*50}")
    print(f"📦 Hikaye {index}/{total} — Seviye: {current_level.upper()}")
    print(f"{'='*50}")

    try:
        # Adim 1: Hikaye uret
        print("Step 1: AI ile hikaye üretiliyor...")
        generate_story(level_override=current_level)

        target_dir = os.path.join("src", "data", "stories", "de", current_level)
        if not os.path.exists(target_dir):
            raise FileNotFoundError(f"Hikaye klasörü bulunamadı: {target_dir}")

        json_files = [
            os.path.join(target_dir, f)
            for f in os.listdir(target_dir)
            if f.endswith(".json")
        ]
        if not json_files:
            raise FileNotFoundError("Hiç JSON dosyası bulunamadı.")

        latest_json = max(json_files, key=os.path.getmtime)
        story_id = os.path.basename(latest_json).replace(".json", "")
        print(f"✅ JSON Hazır: {latest_json}")

        # Adim 2: Video uret
        print("\nStep 2: Video oluşturuluyor...")
        create_storybook(latest_json)

        video_path = os.path.join("temp", f"{current_level}-{story_id}.mp4")
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video üretilemedi: {video_path}")
        print(f"✅ Video Hazır: {video_path}")

        # Adim 3: YouTube'a yukle
        print("\nStep 3: YouTube'a yükleniyor...")
        video_id = upload_video(video_path, latest_json)

        if not video_id:
            raise Exception("YouTube ID alınamadı.")

        # Adim 4: GitHub push
        print("\nStep 4: GitHub'a yedekleniyor...")
        git_push(f"Auto-upload [{current_level.upper()}]: {story_id} — YouTube: {video_id}")

        print(f"\n✅ Hikaye {index}/{total} tamamlandı!")
        print(f"   📺 https://youtu.be/{video_id}")
        return True

    except Exception as e:
        print(f"\n❌ Hikaye {index}/{total} HATA: {str(e)}")
        traceback.print_exc()
        return False


def run_pipeline(level_override: Optional[str] = None, count: int = 1):
    start_time = datetime.now()

    current_level = get_current_level(level_override)

    if current_level is None:
        print("🗓️ Bugün tatil günü — pipeline çalışmıyor.")
        print("   Manuel çalıştırmak için: python master_run.py a1")
        sys.exit(0)

    print(f"\n🚀 Memorlex Pipeline Başlatıldı: {start_time.strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"📅 Seviye: {current_level.upper()} | Toplam: {count} hikaye")

    success = 0
    fail    = 0

    for i in range(1, count + 1):
        ok = run_single(current_level, i, count)
        if ok:
            success += 1
        else:
            fail += 1
        # Birden fazla hikayede API kotasini asimamak icin bekleme
        if i < count:
            wait = 60 if ok else 90  # basarisizsa daha uzun bekle
            print(f"\n⏳ {wait} saniye bekleniyor...")
            import time
            time.sleep(wait)

    print(f"\n{'='*50}")
    print(f"🏁 TÜMÜ TAMAMLANDI")
    print(f"   ✅ Başarılı : {success}")
    print(f"   ❌ Başarısız: {fail}")
    print(f"   ⏱️ Toplam süre: {datetime.now() - start_time}")
    print(f"{'='*50}")


if __name__ == "__main__":
    # Kullanim:
    #   python master_run.py              → bugünün seviyesi, 1 hikaye
    #   python master_run.py b1           → B1, 1 hikaye
    #   python master_run.py b1 5         → B1, 5 hikaye
    #   python master_run.py a1 3         → A1, 3 hikaye
    level_arg = sys.argv[1] if len(sys.argv) > 1 else None
    count_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    run_pipeline(level_override=level_arg, count=count_arg)