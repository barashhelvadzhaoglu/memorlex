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
    """Görseli indirir ve bozuk olup olmadığını kontrol eder."""
    for attempt in range(3):
        try:
            # Seed ekleyerek her denemede farklı sonuç almayı deniyoruz
            url = f"https://pollinations.ai/p/{requests.utils.quote(prompt)}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
            response = requests.get(url, timeout=20)
            if response.status_code == 200 and len(response.content) > 5000:
                with open(path, 'wb') as f:
                    f.write(response.content)
                # PIL ile dosyanın bozuk olmadığını doğrula
                with Image.open(path) as img:
                    img.verify()
                return True
        except:
            print(f"⚠️ Deneme {attempt+1} başarısız, yeniden deneniyor...")
            time.sleep(2)
    return False

def create_storybook(json_path):
    if not os.path.exists(json_path):
        print(f"❌ Hata: {json_path} bulunamadı.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []

    # Ubuntu'da Arial yoktur, Liberation-Sans kesin çalışır.
    FONT_NAME = 'Liberation-Sans' 

    print(f"🎬 {story_id} için Storybook oluşturuluyor...")

    for i, para in enumerate(paragraphs):
        print(f"🔄 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # 1. Ses oluştur
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        # 2. Görsel indir ve doğrula
        img_path = f"temp_img_{i}.jpg"
        # Prompt'u basitleştirerek hata ihtimalini düşürüyoruz
        simple_prompt = f"cinematic illustration of {para[:50]} Germany style"
        
        if not download_valid_image(simple_prompt, img_path, i):
            print(f"🚨 Sahne {i} için görsel alınamadı, yedek arka plan oluşturuluyor.")
            # Resim inmezse düz koyu gri bir resim oluştur
            Image.new('RGB', (1280, 720), color=(40, 40, 40)).save(img_path)

        # 3. Klipleri oluştur (MoviePy v2 syntax)
        img_clip = ImageClip(img_path).with_duration(duration)
        
        txt_clip = TextClip(
            text=para, 
            font_size=32, 
            color='white', 
            font=FONT_NAME,
            method='caption', 
            size=(1100, None), 
            text_align='center',
            bg_color='rgba(0,0,0,0.6)'
        ).with_duration(duration).with_position(('center', 780))

        # Sahneyi birleştir
        scene = CompositeVideoClip([img_clip, txt_clip]).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video render ediliyor (MP4)...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    final_video.write_videofile(output_name, fps=24, codec="libx264", audio_codec="aac", preset="ultrafast")

    # Temizlik
    print("🧹 Geçici dosyalar siliniyor...")
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): os.remove(f)
    
    print(f"✅ İşlem tamamlandı: {output_name}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("❌ Lütfen bir JSON dosyası belirtin.")
