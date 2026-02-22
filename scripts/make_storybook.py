import json
import os
import sys
import requests
import re
import time
from gtts import gTTS
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip
from PIL import Image, ImageDraw

def get_solid_image(path, text_label, index):
    """Görsel inmezse siyah yerine şık bir gradyan/renk oluşturur."""
    colors = [(41, 128, 185), (39, 174, 96), (142, 68, 173), (211, 84, 0)]
    color = colors[index % len(colors)]
    img = Image.new('RGB', (1280, 720), color=color)
    d = ImageDraw.Draw(img)
    # Görselin üzerine debug yazısı ekleyelim (Videoda görünecek)
    # d.text((10,10), f"Scene {index}: {text_label[:20]}", fill=(255,255,255))
    img.save(path, "JPEG")
    return True

def download_image_secure(prompt, path, index):
    """Headers kullanarak bot engelini aşmaya çalışır."""
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    url = f"https://pollinations.ai/p/{requests.utils.quote(clean_prompt[:50])}?width=1280&height=720&nologo=true"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f: f.write(r.content)
            # MoviePy hatasını önlemek için PIL ile açıp tekrar standart formatta kaydet
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG")
            return True
    except: pass
    return get_solid_image(path, prompt, index)

def create_storybook(json_path):
    if not os.path.exists(json_path): return
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    scenes = []
    
    # KESİN ÇÖZÜM: Ubuntu sunucusunda font ismini değil tam yolunu kullan
    FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue
        
        print(f"🎬 Sahne {i+1} hazırlanıyor...")
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        img_path = f"temp_img_{i}.jpg"
        download_image_secure(para, img_path, i)

        # GÖRSEL KATMANI
        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)
        
        # METİN KATMANI (RGBA hatası ve boyut hatası giderildi)
        txt_clip = TextClip(
            text=para,
            font_size=34,
            color='white',
            font=FONT_PATH,
            method='caption',
            size=(1100, 250), # Sabit boyut broadcast hatasını çözer
            text_align='center',
            bg_color='black' # 'rgba' yerine düz renk kullanıp opacity'i aşağıda veriyoruz
        ).with_duration(audio_clip.duration).with_opacity(0.8).with_position(('center', 450))

        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    print("🎥 Video render ediliyor (YUV420P Modu)...")
    final_video = concatenate_videoclips(scenes, method="compose")
    final_video.write_videofile(
        f"{story_id}.mp4", 
        fps=24, 
        codec="libx264", 
        audio_codec="aac",
        ffmpeg_params=["-pix_fmt", "yuv420p"] # Siyah ekranı önleyen hayat kurtarıcı parametre
    )

if __name__ == "__main__":
    if len(sys.argv) > 1: create_storybook(sys.argv[1])
