import json
import os
import sys
import requests
import re
import time
from gtts import gTTS
from PIL import Image

# MoviePy 2.0+ ve Eski Sürümler Arası Import Uyumluluğu
try:
    from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip
except ImportError:
    from moviepy.editor import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip

def download_image(prompt, path, index):
    """JSON içindeki özel İngilizce promptu kullanarak görsel indirir."""
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        encoded_prompt = requests.utils.quote(clean_prompt[:250])
        url = f"https://pollinations.ai/p/{encoded_prompt}?width=1280&height=720&nologo=true&seed={int(time.time())+index}"
        
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f: f.write(r.content)
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG", quality=95)
            return True
    except Exception as e:
        print(f"⚠️ Görsel indirme hatası: {e}")

    try:
        fallback_url = f"https://picsum.photos/seed/{index+int(time.time())}/1280/720"
        r = requests.get(fallback_url, timeout=15)
        if r.status_code == 200:
            with open(path, 'wb') as f: f.write(r.content)
            return True
    except:
        return False

def get_system_font():
    """İşletim sistemine göre uygun font yolunu döndürür."""
    paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",  # macOS
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",  # Linux
        "C:\\Windows\\Fonts\\arial.ttf"  # Windows
    ]
    for p in paths:
        if os.path.exists(p): return p
    return "Arial"

def apply_effect(clip, effect_name, duration=0.5):
    """MoviePy sürümüne göre doğru efekti uygular."""
    method_name = f"with_{effect_name}"
    if hasattr(clip, method_name):
        return getattr(clip, method_name)(duration)
    elif hasattr(clip, effect_name):
        return getattr(clip, effect_name)(duration)
    return clip

def set_clip_attr(clip, attr_name, value):
    """MoviePy sürümüne göre with_X veya set_X metodunu çağırır."""
    for prefix in ['with_', 'set_']:
        method = f"{prefix}{attr_name}"
        if hasattr(clip, method):
            return getattr(clip, method)(value)
    return clip

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
    CROSSFADE_TIME = 1.0 
    print(f"ℹ️ Kullanılan Font: {FONT_PATH} | Efekt: {CROSSFADE_TIME}s Crossfade")

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue
        
        print(f"🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        img_path = f"temp_img_{i}.jpg"
        current_prompt = image_prompts[i] if i < len(image_prompts) else para
        download_image(current_prompt, img_path, i)

        duration = audio_clip.duration + CROSSFADE_TIME
        
        # Klip Ayarları (Sürüm bağımsız)
        bg_clip = ImageClip(img_path)
        bg_clip = set_clip_attr(bg_clip, 'duration', duration)
        bg_clip = set_clip_attr(bg_clip, 'fps', 24)
        
        # Metin Ayarları
        txt_clip = TextClip(
            text=para, 
            font_size=26,               
            color='white', 
            font=FONT_PATH,
            method='caption',           
            size=(1100, 300)
        )
        txt_clip = set_clip_attr(txt_clip, 'duration', duration)
        txt_clip = set_clip_attr(txt_clip, 'position', ('center', 400))
        txt_clip = set_clip_attr(txt_clip, 'opacity', 0.75)

        # Sahne Birleştirme
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720))
        scene = set_clip_attr(scene, 'audio', audio_clip)

        # Fade Efektleri
        scene = apply_effect(scene, "fadein", 0.5)
        scene = apply_effect(scene, "fadeout", 0.5)
        
        scenes.append(scene)

    if scenes:
        print(f"🎥 {len(scenes)} sahne birleştiriliyor...")
        final_video = concatenate_videoclips(scenes, method="compose", padding=-CROSSFADE_TIME)
        output_filename = f"{story_id}.mp4"
        
        final_video.write_videofile(
            output_filename, 
            fps=24, 
            codec="libx264", 
            audio_codec="aac"
        )
        
        # Temizlik
        for i in range(len(paragraphs)):
            for f in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
                if os.path.exists(f):
                    try: os.remove(f)
                    except: pass
        
        print(f"✨ Başarıyla oluşturuldu: {output_filename}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Lütfen bir JSON dosyası yolu belirtin.")