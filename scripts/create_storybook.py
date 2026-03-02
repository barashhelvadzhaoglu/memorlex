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
    1. Pollinations AI (üretken, bağlama uygun)
    2. Unsplash (gerçek fotoğraf, fallback)
    3. Düz renk (son çare)
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    # 1. Pollinations AI - spesifik İngilizce prompt ile
    try:
        encoded = requests.utils.quote(prompt[:120])
        seed = int(time.time()) + index * 137  # Her sahne farklı seed
        url = (
            f"https://pollinations.ai/p/{encoded}"
            f"?width=1280&height=720&nologo=true&seed={seed}&model=flux"
        )
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f:
                f.write(r.content)
            # MoviePy uyumluluğu için normalize et
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG", quality=90)
            print(f"  🎨 Görsel üretildi (Pollinations): {prompt[:60]}...")
            return True
    except Exception as e:
        print(f"  ⚠️  Pollinations hata: {e}")

    # 2. Unsplash - prompt'tan anahtar kelimeler çıkar
    try:
        # Prompt'tan en önemli 3 kelimeyi al (stopwords hariç)
        stopwords = {'realistic','photo','cinematic','lighting','high','quality','a','the','in','at','with','and','of'}
        keywords = [w for w in prompt.lower().split() if w not in stopwords][:3]
        query = '+'.join(keywords)
        unsplash_url = f"https://source.unsplash.com/1280x720/?{query}"
        r = requests.get(unsplash_url, headers=headers, timeout=20, allow_redirects=True)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f:
                f.write(r.content)
            with Image.open(path) as img:
                img.convert('RGB').resize((1280, 720)).save(path, "JPEG", quality=90)
            print(f"  📷 Görsel indirildi (Unsplash): {query}")
            return True
    except Exception as e:
        print(f"  ⚠️  Unsplash hata: {e}")

    # 3. Son çare: gradyan arka plan
    try:
        img = Image.new('RGB', (1280, 720), color=(30, 50, 80))
        img.save(path)
        print(f"  🎨 Düz renk arka plan kullanıldı.")
        return True
    except:
        return False


def create_storybook(json_path):
    if not os.path.exists(json_path):
        print(f"Hata: {json_path} bulunamadı.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']

    # image_prompts varsa kullan, yoksa paragraf metnini fallback olarak kullan
    image_prompts = data.get('image_prompts', [])
    if len(image_prompts) < len(paragraphs):
        # Eksik promptları paragraf metniyle doldur
        image_prompts.extend(paragraphs[len(image_prompts):])

    scenes = []
    FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

    for i, para in enumerate(paragraphs):
        if not para.strip():
            continue

        print(f"\n🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")

        # 1. Ses Oluşturma
        audio_path = f"temp_audio_{i}.mp3"
        gTTS(text=para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        # 2. Görsel - image_prompts kullan
        img_path = f"temp_img_{i}.jpg"
        img_prompt = image_prompts[i] if i < len(image_prompts) else para
        download_image(img_prompt, img_path, i)

        # 3. Klipleri Oluşturma
        bg_clip = ImageClip(img_path).with_duration(audio_clip.duration).with_fps(24)

        txt_clip = TextClip(
            text=para,
            font_size=28,
            color='white',
            font=FONT_PATH,
            method='caption',
            size=(1100, 250),
            text_align='center',
            bg_color='black'
        ).with_duration(audio_clip.duration).with_opacity(0.78).with_position(('center', 450))

        # 4. Sahneyi Birleştirme
        scene = CompositeVideoClip([bg_clip, txt_clip], size=(1280, 720)).with_audio(audio_clip)
        scenes.append(scene)

    # 5. Final Render
    print("\n🎥 Video birleştiriliyor ve kaydediliyor...")
    final_video = concatenate_videoclips(scenes, method="compose")
    output_filename = f"{story_id}.mp4"

    final_video.write_videofile(
        output_filename,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        preset="ultrafast",
        ffmpeg_params=["-pix_fmt", "yuv420p"]
    )

    # 6. Geçici dosyaları temizle
    print("🧹 Temizlik yapılıyor...")
    for i in range(len(paragraphs)):
        for tmp in [f"temp_audio_{i}.mp3", f"temp_img_{i}.jpg"]:
            if os.path.exists(tmp):
                os.remove(tmp)

    print(f"✅ Video hazır: {output_filename}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Kullanım: python create_storybook.py <json_dosyası>")
        print("Örnek:    python create_storybook.py src/data/stories/de/a2/storie-002.json")
