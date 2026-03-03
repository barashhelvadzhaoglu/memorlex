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
    """
    image_prompts alanından gelen İngilizce, spesifik prompt ile görsel üretir.
    Pollinations AI Flux modelini kullanarak yüksek kaliteli sonuçlar hedefler.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    try:
        # Prompt'u URL güvenli hale getir ve seed ekleyerek varyasyon sağla
        encoded = requests.utils.quote(prompt[:200])
        seed = int(time.time()) + (index * 137)
        url = (
            f"https://pollinations.ai/p/{encoded}"
            f"?width=1280&height=720&nologo=true&seed={seed}&model=flux&enhance=true"
        )
        
        r = requests.get(url, headers=headers, timeout=45)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f:
                f.write(r.content)
            
            # Görüntüyü normalize et (MoviePy bazen ham JPG'lerde sorun yaşayabilir)
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG", quality=95)
            print(f"  🎨 Görsel üretildi (Pollinations Flux): {prompt[:60]}...")
            return True
    except Exception as e:
        print(f"  ⚠️ Görsel üretim hatası: {e}")

    # Fallback: Unsplash üzerinden anahtar kelimelerle ara
    try:
        keywords = [w for w in prompt.lower().split() if len(w) > 3][:3]
        query = '+'.join(keywords)
        unsplash_url = f"https://source.unsplash.com/1280x720/?{query}"
        r = requests.get(unsplash_url, headers=headers, timeout=20)
        if r.status_code == 200:
            with open(path, 'wb') as f:
                f.write(r.content)
            print(f"  📷 Fallback görsel (Unsplash): {query}")
            return True
    except:
        pass

    # Son çare: Koyu bir arka plan oluştur
    img = Image.new('RGB', (1280, 720), color=(30, 40, 50))
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

    # Çıktı klasörü kontrolü
    output_dir = "output_videos"
    os.makedirs(output_dir, exist_ok=True)

    # Font Seçimi: macOS vs Linux (GitHub Actions)
    FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    if not os.path.exists(FONT_PATH):
        # GitHub Actions (Ubuntu) yolu
        FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    scenes = []

    for i, para in enumerate(paragraphs):
        if not para.strip():
            continue

        print(f"\n🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")

        # 1. Ses Dosyası (gTTS)
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # 2. Görsel Dosyası
        img_path = f"temp_img_{i}.jpg"
        # Eğer JSON'da image_prompts varsa onu kullan, yoksa metni gönder
        img_prompt = image_prompts[i] if i < len(image_prompts) else para
        download_image(img_prompt, img_path, i)

        # 3. Kliplerin Oluşturulması
        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)

        # Yazı Katmanı: Okunabilirliği artırmak için siyah bant (bg_color)
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

        # 4. Sahne Birleştirme
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    # 5. Final Render
    print("\n🎥 Video birleştiriliyor ve kaydediliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_filename = os.path.join(output_dir, f"{story_id}.mp4")

    final_video.write_videofile(
        output_filename,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        preset="medium",
        ffmpeg_params=["-pix_fmt", "yuv420p"]
    )

    # 6. Temizlik
    print("🧹 Geçici dosyalar temizleniyor...")
    for i in range(len(paragraphs)):
        for tmp in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(tmp):
                os.remove(tmp)

    print(f"\n✅ BAŞARILI: Video hazır -> {output_filename}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Kullanım: python scripts/create_storybook.py <json_dosyası>")