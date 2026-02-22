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
    """Kendini gerçek bir kullanıcı gibi tanıtarak görsel indirir."""
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    url = f"https://pollinations.ai/p/{requests.utils.quote(clean_prompt[:60])}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
    
    # Network Security Mühendisi dokunuşu: User-Agent ekleyerek bot engelini aşma
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://pollinations.ai/'
    }

    try:
        # 1. Tercih: AI Görsel
        r = requests.get(url, headers=headers, timeout=20)
        if r.status_code == 200 and len(r.content) > 15000:
            with open(path, 'wb') as f: f.write(r.content)
            print(f"✅ Sahne {index}: AI Görseli başarıyla alındı.")
            return True
    except: pass

    try:
        # 2. Tercih: Google/CDN üzerinden hızlı görsel (Yedek)
        print(f"⚠️ Sahne {index}: AI başarısız, hızlı görsel çekiliyor...")
        fallback_url = f"https://picsum.photos/seed/{index+int(time.time())}/1280/720"
        r = requests.get(fallback_url, timeout=15)
        with open(path, 'wb') as f: f.write(r.content)
        return True
    except: return False

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
        if not download_image(para, img_path, i):
            # En son çare: Mavi arka plan (Kırmızıdan iyi hissettirir!)
            Image.new('RGB', (1280, 720), color=(30, 60, 90)).save(img_path)

        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)
        txt_clip = TextClip(
            text=para, font_size=32, color='white', font=FONT_PATH,
            method='caption', size=(1100, 200), text_align='center', bg_color='black'
        ).with_duration(audio_clip.duration).with_opacity(0.8).with_position(('center', 520))

        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video birleştiriliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    final_video.write_videofile(f"{story_id}.mp4", fps=24, codec="libx264", audio_codec="aac", 
                                preset="ultrafast", ffmpeg_params=["-pix_fmt", "yuv420p"])

if __name__ == "__main__":
    if len(sys.argv) > 1: create_storybook(sys.argv[1])
