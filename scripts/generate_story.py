import json
import os
import sys
import requests
import time
from gtts import gTTS
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip
from PIL import Image

def download_image(prompt, path, index):
    """
    image_prompts alanından gelen İngilizce prompt ile görsel üretir.
    Pollinations AI Flux modelini önceliklendirir.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    # 1. Pollinations AI - Flux Model (En yüksek kalite)
    try:
        # Prompt'u URL güvenli hale getir
        encoded = requests.utils.quote(prompt[:200])
        seed = int(time.time()) + (index * 137)
        # Daha gerçekçi sonuçlar için 'flux' veya 'turbo' modelini zorluyoruz
        url = (
            f"https://pollinations.ai/p/{encoded}"
            f"?width=1280&height=720&nologo=true&seed={seed}&model=flux&enhance=true"
        )
        r = requests.get(url, headers=headers, timeout=45)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f:
                f.write(r.content)
            
            # MoviePy / FFmpeg uyumluluğu için görüntüyü normalize et
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG", quality=95)
            print(f"  🎨 Görsel üretildi (Pollinations Flux): {prompt[:60]}...")
            return True
    except Exception as e:
        print(f"  ⚠️ Pollinations hatası: {e}")

    # 2. Son çare: Gradyan arka plan (Unsplash bazen Mac'te timeout verebilir)
    img = Image.new('RGB', (1280, 720), color=(40, 44, 52))
    img.save(path)
    print(f"  🎨 Default arka plan kullanıldı.")
    return True

def create_storybook(json_path):
    if not os.path.exists(json_path):
        print(f"❌ Hata: {json_path} bulunamadı.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    image_prompts = data.get('image_prompts', [])

    # Klasör kontrolü
    output_dir = "output_videos"
    os.makedirs(output_dir, exist_ok=True)

    scenes = []
    
    # macOS için font yolu (Arial Bold her Mac'te vardır)
    FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    # Eğer Linux/GitHub Actions ise:
    if not os.path.exists(FONT_PATH):
        FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    for i, para in enumerate(paragraphs):
        if not para.strip(): continue

        print(f"\n🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")

        # 1. Ses (gTTS)
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # 2. Görsel
        img_path = f"temp_img_{i}.jpg"
        img_prompt = image_prompts[i] if i < len(image_prompts) else para
        download_image(img_prompt, img_path, i)

        # 3. Klipler
        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)
        
        # Yazı katmanı - Okunabilirliği artırmak için siyah bant (bg_color) eklendi
        txt_clip = TextClip(
            text=para,
            font_size=32,
            color='white',
            font=FONT_PATH,
            method='caption',
            size=(1100, None),
            text_align='center',
            bg_color='rgba(0,0,0,0.6)' 
        ).with_duration(audio_clip.duration).with_position(('center', 500))

        # 4. Composite
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    # 5. Render
    print("\n🎥 Video birleştiriliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_path = os.path.join(output_dir, f"{story_id}.mp4")

    final_video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        # Mac işlemcisi (M1/M2/M3) için hızı artırır
        preset="medium" 
    )

    # 6. Temizlik
    for i in range(len(paragraphs)):
        for tmp in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(tmp): os.remove(tmp)

    print(f"\n✅ Video hazır: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Kullanım: python scripts/create_storybook.py <json_dosyası>")