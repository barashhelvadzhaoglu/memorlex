import json
import os
import sys
import requests
import re
import time
from gtts import gTTS
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip
from PIL import Image

def download_image(prompt, path, index):
    """AI veya Fallback üzerinden görsel indirir."""
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    # User-Agent ekleyerek bot engelini aşıyoruz
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    # 1. Tercih: Pollinations AI
    try:
        url = f"https://pollinations.ai/p/{requests.utils.quote(clean_prompt[:60])}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
        r = requests.get(url, headers=headers, timeout=20)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f: f.write(r.content)
            # MoviePy uyumluluğu için PIL ile normalize et
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG")
            return True
    except:
        pass

    # 2. Tercih: Picsum (Yedek)
    try:
        fallback_url = f"https://picsum.photos/seed/{index+int(time.time())}/1280/720"
        r = requests.get(fallback_url, timeout=15)
        with open(path, 'wb') as f: f.write(r.content)
        return True
    except:
        return False

def create_storybook(json_path):
    if not os.path.exists(json_path):
        print(f"Hata: {json_path} bulunamadı.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []
    
    # Linux/GitHub Actions için font yolu (Liberation Sans çoğu Ubuntu'da varsayılandır)
    FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue
        
        print(f"🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # 1. Ses Oluşturma
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # 2. Görsel İndirme
        img_path = f"temp_img_{i}.jpg"
        if not download_image(para, img_path, i):
            # Hiçbiri olmazsa düz renkli görsel oluştur
            Image.new('RGB', (1280, 720), color=(44, 62, 80)).save(img_path)

        # 3. Klipleri Oluşturma
        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)
        
        # Metin Alanı Düzenlemesi (Siyah kutuya sığdırma fix)
        txt_clip = TextClip(
            text=para, 
            font_size=30,               # Okunabilir boyut
            color='white', 
            font=FONT_PATH,
            method='caption',           # Yazıyı kutuya sığdırır (Word wrap)
            size=(1100, 240),           # Siyah kutunun genişlik ve yüksekliği
            text_align='center',
            bg_color='black'            # Yazı arkasındaki siyah alan
        ).with_duration(audio_clip.duration).with_opacity(0.75).with_position(('center', 460))

        # 4. Sahneyi Birleştirme
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    # 5. Final Render
    print("🎥 Video birleştiriliyor ve kaydediliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_filename = f"{story_id}.mp4"
    
    final_video.write_videofile(
        output_filename, 
        fps=24, 
        codec="libx264", 
        audio_codec="aac",
        preset="ultrafast",
        ffmpeg_params=["-pix_fmt", "yuv420p"] # Tüm cihazlarda oynatma garantisi
    )
    
    # Geçici dosyaları temizle
    print("🧹 Temizlik yapılıyor...")
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): os.remove(f)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Lütfen bir JSON dosyası yolu belirtin.")
