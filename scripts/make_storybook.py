import json
import os
import sys
import requests
import re
import time
from gtts import gTTS
# MoviePy v2.0 uyumlu
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip

def download_image(prompt, path, index):
    """Görseli indirir ve geçerliliğini kontrol eder."""
    for attempt in range(3): # 3 deneme hakkı
        try:
            url = f"https://pollinations.ai/p/{requests.utils.quote(prompt)}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
            response = requests.get(url, timeout=20)
            if response.status_code == 200 and len(response.content) > 5000: # En az 5KB olmalı
                with open(path, 'wb') as f:
                    f.write(response.content)
                # PIL ile dosyanın açılabilir olduğunu doğrula
                from PIL import Image
                with Image.open(path) as img:
                    img.verify() 
                return True
        except Exception as e:
            print(f"⚠️ Deneme {attempt+1} başarısız: {e}")
            time.sleep(2)
    return False

def create_storybook(json_path):
    if not os.path.exists(json_path): return print(f"❌ {json_path} yok.")

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []

    for i, para in enumerate(paragraphs):
        print(f"🔄 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # Ses oluştur
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # Görsel İndir ve Doğrula
        img_path = f"temp_img_{i}.jpg"
        prompt = f"cinematic illustration of {para[:50]} Germany style"
        
        if not download_image(prompt, img_path, i):
            print("🚨 Görsel alınamadı, yedek renk oluşturuluyor...")
            from PIL import Image
            Image.new('RGB', (1280, 720), color=(40, 40, 40)).save(img_path)

        # Sahne montajı
        img_clip = ImageClip(img_path).with_duration(audio_clip.duration)
        txt_clip = TextClip(
            text=para, font_size=32, color='white', font='Arial',
            method='caption', size=(1100, None), text_align='center',
            bg_color='rgba(0,0,0,0.6)'
        ).with_duration(audio_clip.duration).with_position(('center', 780))

        scene = CompositeVideoClip([img_clip, txt_clip]).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video birleştiriliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    final_video.write_videofile(output_name, fps=24, codec="libx264", audio_codec="aac", preset="ultrafast")
    return output_name

if __name__ == "__main__":
    if len(sys.argv) > 1: create_storybook(sys.argv[1])
