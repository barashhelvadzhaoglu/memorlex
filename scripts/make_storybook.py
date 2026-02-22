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
    for attempt in range(3):
        try:
            url = f"https://pollinations.ai/p/{requests.utils.quote(prompt)}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
            response = requests.get(url, timeout=20)
            if response.status_code == 200 and len(response.content) > 5000:
                with open(path, 'wb') as f:
                    f.write(response.content)
                with Image.open(path) as img:
                    img.verify()
                return True
        except:
            time.sleep(2)
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
        # Boş paragraf kontrolü
        if not para or len(para.strip()) == 0: continue
        
        print(f"🔄 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # 1. Ses
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # 2. Görsel
        img_path = f"temp_img_{i}.jpg"
        if not download_valid_image(f"Germany {para[:40]}", img_path, i):
            Image.new('RGB', (1280, 720), color=(40, 40, 40)).save(img_path)

        # 3. Klipler
        img_clip = ImageClip(img_path).with_duration(audio_clip.duration)
        
        # HATA ÇÖZÜMÜ: 
        # size parametresinde yüksekliği None yerine sabit vererek broadcast hatasını önlüyoruz.
        # bg_color formatını 'black' yaparak ValueError: unknown color'ı çözüyoruz.
        txt_clip = TextClip(
            text=para, 
            font_size=28, 
            color='white', 
            font=FONT_PATH,
            method='caption', 
            size=(1000, 200), # Sabit yükseklik broadcast hatasını engeller
            text_align='center',
            bg_color='black' 
        ).with_duration(audio_clip.duration).with_position(('center', 500)).with_opacity(0.8)

        scene = CompositeVideoClip([img_clip, txt_clip]).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video birleştiriliyor...")
    if not scenes: return print("❌ Sahne oluşturulamadı.")
    
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    final_video.write_videofile(output_name, fps=24, codec="libx264", audio_codec="aac", preset="ultrafast")
    
    # Temizlik
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): os.remove(f)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
