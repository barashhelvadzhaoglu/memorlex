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
    """Görseli indirir ve geçerliliğini kontrol eder."""
    # Daha iyi sonuç için prompt'u optimize edelim
    search_prompt = f"high quality cinematic illustration, {prompt}, masterpiece, 4k"
    for attempt in range(3):
        try:
            url = f"https://pollinations.ai/p/{requests.utils.quote(search_prompt)}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
            response = requests.get(url, timeout=25)
            if response.status_code == 200 and len(response.content) > 10000: # 10KB altı genelde bozuktur
                with open(path, 'wb') as f:
                    f.write(response.content)
                # Dosyanın gerçekten bir resim olduğunu doğrula
                with Image.open(path) as img:
                    img.verify()
                return True
        except Exception as e:
            print(f"⚠️ Deneme {attempt+1} başarısız: {e}")
            time.sleep(3)
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
        
        print(f"🔄 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # 1. Ses
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        # 2. Görsel
        img_path = f"temp_img_{i}.jpg"
        # Paragrafın sadece ilk kısmını prompt yapalım (çok uzun prompt hata verebilir)
        short_para = " ".join(para.split()[:10])
        if not download_valid_image(short_para, img_path, i):
            print(f"🚨 Görsel {i} indirilemedi, renkli yedek oluşturuluyor.")
            # Tamamen siyah yerine koyu mavi/gri bir renk yapalım ki çalıştığını anlayalım
            Image.new('RGB', (1280, 720), color=(45, 52, 54)).save(img_path)

        # 3. Klipler
        # Görseli ana katman yapıyoruz
        bg_clip = ImageClip(img_path).with_duration(duration).with_fps(24)
        
        # Metin kutusunu oluşturuyoruz
        txt_clip = TextClip(
            text=para, 
            font_size=30, 
            color='white', 
            font=FONT_PATH,
            method='caption', 
            size=(1100, 180), # Sabit yükseklik
            text_align='center',
            bg_color='black'
        ).with_duration(duration).with_opacity(0.7).with_position(('center', 520))

        # Sahneyi birleştirirken sıralama önemli: [Arkaplan, Üstteki Nesne]
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video birleştiriliyor (Final MP4)...")
    if not scenes: return
    
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    
    # Render ayarlarını "libx264" ve "high" profile çekelim
    final_video.write_videofile(
        output_name, 
        fps=24, 
        codec="libx264", 
        audio_codec="aac", 
        temp_audiofile='temp-audio.m4a', 
        remove_temp=True,
        preset="ultrafast"
    )
    
    # Temizlik
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): os.remove(f)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
