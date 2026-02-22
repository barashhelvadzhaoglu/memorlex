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
    """Görseli indirir ve varlığını teyit eder."""
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    search_prompt = f"digital illustration of {clean_prompt[:50]}, cinematic"
    
    for attempt in range(3):
        try:
            url = f"https://pollinations.ai/p/{requests.utils.quote(search_prompt)}?width=1280&height=720&nologo=true&seed={int(time.time())+index+attempt}"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200 and len(response.content) > 10000:
                with open(path, 'wb') as f:
                    f.write(response.content)
                # Dosyayı Pillow ile açarak doğruluğunu kontrol et
                with Image.open(path) as img:
                    img.verify()
                print(f"✅ Sahne {index}: Görsel indirildi ({len(response.content)} bytes)")
                return True
        except Exception as e:
            print(f"⚠️ Sahne {index}: Deneme {attempt+1} hatası: {e}")
            time.sleep(3)
    return False

def create_storybook(json_path):
    if not os.path.exists(json_path): return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []
    FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue
        
        print(f"🎬 Sahne {i+1} hazırlanıyor...")
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        img_path = f"temp_img_{i}.jpg"
        # Eğer görsel inmezse siyah yerine parlak bir renk (Kırmızı) oluşturuyoruz ki 
        # görselin inmediğini videoda kabak gibi görelim.
        if not download_valid_image(para, img_path, i):
            print(f"🚨 Sahne {i}: GÖRSEL İNMEDİ!")
            Image.new('RGB', (1280, 720), color=(255, 0, 0)).save(img_path)

        # ÖNEMLİ: ImageClip nesnesini oluştururken is_mask=False ve transparent=False yapıyoruz
        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)
        
        txt_clip = TextClip(
            text=para, 
            font_size=32, 
            color='white', 
            font=FONT_PATH,
            method='caption', 
            size=(1100, 200),
            text_align='center',
            bg_color='black'
        ).with_duration(audio_clip.duration).with_opacity(0.8).with_position(('center', 500))

        # Sahneyi oluştururken CompositeVideoClip'in temel klibini bg_clip yapıyoruz
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video render ediliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    
    final_video.write_videofile(
        output_name, 
        fps=24, 
        codec="libx264", 
        audio_codec="aac",
        preset="ultrafast",
        ffmpeg_params=["-pix_fmt", "yuv420p"]
    )
    
    # Temizlik
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): os.remove(f)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
