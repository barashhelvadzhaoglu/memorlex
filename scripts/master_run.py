import os
import sys
import traceback
import subprocess
from datetime import datetime

# Mevcut scriptlerimizden fonksiyonları import ediyoruz
try:
    from generate_story import generate_story
    from create_storybook import create_storybook
    from upload_youtube import upload_video
except ImportError as e:
    print(f"❌ Modül import hatası: {e}")
    print("Lütfen tüm scriptlerin aynı klasörde olduğundan emin olun.")
    sys.exit(1)

def git_push(message):
    """Yapılan değişiklikleri GitHub'a push eder."""
    try:
        print("\n🌐 GitHub Güncellemesi Başlatılıyor...")
        # Değişiklikleri sahnele (Sadece JSON'lar ve kodlar, .gitignore sayesinde güvendeyiz)
        subprocess.run(["git", "add", "."], check=True)
        
        # Commit oluştur
        subprocess.run(["git", "commit", "-m", message], check=True)
        
        # Push et (Main branch olduğunu varsayıyoruz)
        subprocess.run(["git", "push", "origin", "main"], check=True)
        
        print("✅ Değişiklikler GitHub'a başarıyla push edildi.")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git Hatası (Muhtemelen push edilecek bir şey yok veya bağlantı hatası): {e}")
    except Exception as e:
        print(f"❌ Beklenmedik Git Hatası: {e}")

def run_pipeline():
    start_time = datetime.now()
    print(f"\n🚀 Memorlex Otomasyonu Başlatıldı: {start_time.strftime('%d/%m/%Y %H:%M:%S')}")
    print("-" * 50)

    try:
        # 1. ADIM: Hikaye ve JSON Üretimi
        print("Step 1: AI ile sınav odaklı hikaye üretiliyor...")
        generate_story() 
        
        # En son oluşturulan JSON'u bul
        target_dir = os.path.join("src", "data", "stories", "de", "c1")
        json_files = [os.path.join(target_dir, f) for f in os.listdir(target_dir) if f.endswith('.json')]
        latest_json = max(json_files, key=os.path.getmtime)
        story_id = os.path.basename(latest_json).replace(".json", "")
        print(f"✅ JSON Hazır: {latest_json}")

        # 2. ADIM: Video Üretimi
        print("\nStep 2: Video ve ses dosyaları oluşturuluyor...")
        create_storybook(latest_json)
        
        video_path = os.path.join("temp", f"{story_id}.mp4")
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video dosyası üretilemedi: {video_path}")
        print(f"✅ Video Hazır: {video_path}")

        # 3. ADIM: YouTube'a Yükleme
        print("\nStep 3: YouTube yüklemesi başlatılıyor...")
        # upload_video fonksiyonu (video_path, json_path) bekliyor
        video_id = upload_video(video_path, latest_json)
        
        if not video_id:
            raise Exception("YouTube ID alınamadı, yükleme başarısız olmuş olabilir.")

        # 4. ADIM: GitHub Push
        # Güncellenen JSON'u (youtubeId içeriyor) GitHub'a gönderiyoruz
        print("\nStep 4: Veriler GitHub'a yedekleniyor...")
        commit_msg = f"Auto-upload: {story_id} - YouTube ID: {video_id}"
        git_push(commit_msg)

        print("-" * 50)
        print(f"✨ TÜM SÜREÇ BAŞARIYLA TAMAMLANDI!")
        print(f"📺 Video Linki: https://youtu.be/{video_id}")
        print(f"⏱️ Toplam Süre: {datetime.now() - start_time}")

    except Exception as e:
        print(f"\n❌ HATALI DURDURMA: {str(e)}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_pipeline()