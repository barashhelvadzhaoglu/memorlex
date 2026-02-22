import json
import os
import sys
import requests
import re
import time
from gtts import gTTS
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip
from PIL import Image

def download_valid_image(prompt, path, index):
    """Görseli indirir ve gerçek bir dosya olduğunu teyit eder."""
    # Daha temiz bir görsel için promptu optimize et
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    search_prompt = f"cinematic storybook illustration of {clean_prompt[:60]}"
    
    for attempt in range(3):
        try:
            # Seed değerini değiştirerek her seferinde taze görsel istiyoruz
            url = f"https://pollinations.ai/p/{requests.utils.quote(search_prompt)}?width=1280&height=720&nologo=true&seed={int(time.time())+index+attempt}"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200 and len(response.content) > 15000:
                with open(path, 'wb') as f:
                    f.write(response.content)
                # Dosyayı Pillow ile açarak doğruluğunu kontrol et
                with Image.open(path) as img:
                    img.verify()
                return True
        except:
            print(f"⚠️ Sahne {index} görsel denemesi {attempt+1} başarısız...")
            time.sleep(4)
    return False

def create_storybook(json_path):
    if not os.path.exists(json_path): return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []

    # Ubuntu'daki kesin font yolu
    FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue
        
        print(f"🔄 Sahne {i+1} hazırlanıyor...")
        
        # 1. Ses Oluşturma
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        # 2. Görsel İndirme
        img_path = f"temp_img_{i}.jpg"
        if not download_valid_image(para, img_path, i):
            print(f"🚨 Sahne {i} görseli indirilemedi, renkli yedek oluşturuluyor.")
            # Siyah yerine renkli bir kare oluştur ki çalıştığını görelim
            Image.new('RGB', (1280, 720), color=(60, 100, 150)).save(img_path)

        # 3. Katmanları Oluşturma
        # Arkaplan görseli (FPS'i açıkça belirtiyoruz)
        bg_clip = ImageClip(img_path).with_duration(duration).with_fps(24)
        
        # Metin kutusu (Arkaplanını siyah yapıp şeffaflığı klibin kendisine veriyoruz)
        txt_clip = TextClip(
            text=para, 
            font_size=32, 
            color='white', 
            font=FONT_PATH,
            method='caption', 
            size=(1100, 200),
            text_align='center',
            bg_color='black'
        ).with_duration(duration).with_opacity(0.7).with_position(('center', 500))

        # Sahneyi birleştir (Sıralama: bg_clip altta, txt_clip üstte)
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    if not scenes: 
        print("❌ Hiç sahne oluşturulamadı.")
        return

    print("🎥 Final videosu birleştiriliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    
    # Render (codec ve profile ayarları siyah ekranı önlemek için kritiktir)
    final_video.write_videofile(
        output_name, 
        fps=24, 
        codec="libx264", 
        audio_codec="aac",
        preset="ultrafast",
        ffmpeg_params=["-pix_fmt", "yuv420p"] # Çoğu oynatıcı için standart format
    )

    # Temizlik
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): 
                try: os.remove(f)
                except: pass

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
