import json
import os
import sys
import requests
import re
import time
from gtts import gTTS
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip

def create_storybook(json_path):
    if not os.path.exists(json_path):
        print(f"❌ Hata: {json_path} bulunamadı.")
        return None

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []

    print(f"🎬 {story_id} render başlatıldı...")

    for i, para in enumerate(paragraphs):
        print(f"🔄 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # A. Ses
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        # B. Görsel (Geliştirilmiş İndirme Kontrolü)
        clean_para = re.sub(r'\W+', ' ', para)
        prompt_keywords = " ".join(clean_para.split()[:8])
        img_url = f"https://pollinations.ai/p/{requests.utils.quote(prompt_keywords)}?width=1280&height=720&nologo=true&seed={int(time.time())+i}"
        
        img_path = f"temp_img_{i}.jpg"
        try:
            # Görseli indir ve boyutunu kontrol et
            response = requests.get(img_url, timeout=30)
            if response.status_code == 200 and len(response.content) > 1000:
                with open(img_path, 'wb') as f:
                    f.write(response.content)
            else:
                raise Exception("Geçersiz görsel verisi")
        except Exception as e:
            print(f"⚠️ Görsel hatası ({e}), düz renk oluşturuluyor...")
            # Eğer görsel inmezse hata vermemesi için siyah bir görsel oluştur (Opsiyonel: ImageClip ile düz renk)
            from PIL import Image
            Image.new('RGB', (1280, 720), color=(30, 30, 30)).save(img_path)

        # C. Sahne (MoviePy 2.0 Syntax)
        img_clip = ImageClip(img_path).with_duration(duration)
        
        txt_clip = TextClip(
            text=para, 
            font_size=32, 
            color='white', 
            font='Arial', 
            method='caption', 
            size=(1100, None),
            text_align='center',
            bg_color='rgba(0,0,0,0.6)'
        ).with_duration(duration).with_position(('center', 780))

        scene = CompositeVideoClip([img_clip, txt_clip]).with_audio(audio_clip)
        scenes.append(scene)

    # 2. Birleştirme
    print("🎥 MP4 oluşturuluyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_name = f"{story_id}.mp4"
    # GitHub'da daha hızlı render için preset ekledim
    final_video.write_videofile(output_name, fps=24, codec="libx264", audio_codec="aac", preset="ultrafast")

    # 3. Temizlik
    for i in range(len(paragraphs)):
        for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(f): os.remove(f)
    
    print(f"✅ Başarılı: {output_name}")
    return output_name

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
