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
    """JSON içindeki özel İngilizce promptu kullanarak görsel indirir."""
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        # Pollinations AI üzerinden yüksek kaliteli görsel çekimi
        encoded_prompt = requests.utils.quote(clean_prompt[:250])
        url = f"https://pollinations.ai/p/{encoded_prompt}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
        
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f: f.write(r.content)
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG", quality=95)
            return True
    except Exception as e:
        print(f"⚠️ Görsel indirme hatası (Pollinations): {e}")

    try:
        # Fallback: Picsum (Hata durumunda yedek görsel)
        fallback_url = f"https://picsum.photos/seed/{index+int(time.time())}/1280/720"
        r = requests.get(fallback_url, timeout=15)
        if r.status_code == 200:
            with open(path, 'wb') as f: f.write(r.content)
            return True
    except:
        return False

def get_system_font():
    """İşletim sistemine göre (macOS/Linux) uygun font yolunu döndürür."""
    paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",  # macOS (Münih'teki lokal makinen)
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",  # Linux (GitHub Actions/Server)
        "C:\\Windows\\Fonts\\arial.ttf"  # Windows
    ]
    for p in paths:
        if os.path.exists(p): return p
    return "Arial"

def create_storybook(json_path):
    if not os.path.exists(json_path):
        print(f"Hata: {json_path} bulunamadı.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    image_prompts = data.get('image_prompts', paragraphs)
    story_id = data['id']
    scenes = []
    
    FONT_PATH = get_system_font()
    CROSSFADE_TIME = 1.0 # Sahneler arası geçiş süresi (saniye)
    print(f"ℹ️ Kullanılan Font: {FONT_PATH} | Efekt: {CROSSFADE_TIME}s Crossfade")

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue
        
        print(f"🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # 1. Ses Oluşturma (Google TTS)
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # 2. Görsel İndirme (JSON'daki İngilizce Prompt ile)
        img_path = f"temp_img_{i}.jpg"
        current_prompt = image_prompts[i] if i < len(image_prompts) else para
        
        if not download_image(current_prompt, img_path, i):
            Image.new('RGB', (1280, 720), color=(20, 30, 48)).save(img_path)

        # 3. Klipleri Oluşturma
        # Crossfade için her klibin süresine geçiş payı ekliyoruz
        duration = audio_clip.duration + CROSSFADE_TIME
        bg_clip = ImageClip(img_path).with_duration(duration).with_fps(24)
        
        # Metin Alanı (3-4 cümlelik C1 metinleri için optimize edildi)
        txt_clip = TextClip(
            text=para, 
            font_size=26,               
            color='white', 
            font=FONT_PATH,
            method='caption',           
            size=(1100, 300),           
            text_align='center',
            bg_color='black'            
        ).with_duration(duration).with_opacity(0.75).with_position(('center', 400))

        # 4. Sahneyi Birleştirme ve Fade Efektleri
        # Sahne içi yumuşak giriş-çıkış
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scene = scene.with_effects([lambda clip: clip.with_fadein(0.5), lambda clip: clip.with_fadeout(0.5)])
        
        scenes.append(scene)

    # 5. Final Render
    if scenes:
        print(f"🎥 {len(scenes)} sahne Crossfade ile birleştiriliyor...")
        # padding=-CROSSFADE_TIME: Sahneleri birbirinin üzerine bindirerek profesyonel geçiş sağlar
        final_video = concatenate_videoclips(scenes, method="compose", padding=-CROSSFADE_TIME)
        output_filename = f"{story_id}.mp4"
        
        final_video.write_videofile(
            output_filename, 
            fps=24, 
            codec="libx264", 
            audio_codec="aac",
            preset="ultrafast",
            threads=4,
            ffmpeg_params=["-pix_fmt", "yuv420p"]
        )
        
        print("🧹 Geçici dosyalar temizleniyor...")
        for i in range(len(paragraphs)):
            for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
                if os.path.exists(f):
                    try: os.remove(f)
                    except: pass
        
        print(f"✨ İşlem tamamlandı: {os.path.abspath(output_filename)}")
    else:
        print("❌ Hata: Sahne oluşturulamadı.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Lütfen bir JSON dosyası yolu belirtin.")