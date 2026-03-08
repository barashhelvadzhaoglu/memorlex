import json
import os
import sys
import re
import requests
import time
import textwrap
from gtts import gTTS
import asyncio
import edge_tts
import random

DE_VOICES = [
    "de-DE-AmalaNeural",
    "de-DE-ConradNeural",
    "de-DE-FlorianMultilingualNeural",
    "de-DE-KatjaNeural",
    "de-DE-KillianNeural",
    "de-DE-SeraphinaMultilingualNeural",
]
import random

DE_VOICES = [
    "de-DE-AmalaNeural",
    "de-DE-ConradNeural",
    "de-DE-FlorianMultilingualNeural",
    "de-DE-KatjaNeural",
    "de-DE-KillianNeural",
    "de-DE-SeraphinaMultilingualNeural",
]
from PIL import Image, ImageDraw, ImageFont
from typing import Optional

try:
    from moviepy import (
        ImageClip, AudioFileClip, TextClip,
        concatenate_videoclips, CompositeVideoClip, VideoFileClip
    )
except ImportError:
    from moviepy.editor import (
        ImageClip, AudioFileClip, TextClip,
        concatenate_videoclips, CompositeVideoClip, VideoFileClip
    )

TEMP_DIR = "temp"
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(os.path.dirname(SCRIPTS_DIR))
ENTRANCE_VIDEO = os.path.join(PROJECT_DIR, "video", "enterence.mp4")
CLOSE_VIDEO    = os.path.join(PROJECT_DIR, "video", "close.mp4")

VIDEO_W = 1920
VIDEO_H = 1080
FPS     = 24


def cleanup_old_files(directory, days=3):
    if not os.path.exists(directory):
        os.makedirs(directory)
        return
    cutoff = time.time() - days * 86400
    for f in os.listdir(directory):
        fp = os.path.join(directory, f)
        if os.path.isfile(fp) and os.path.getmtime(fp) < cutoff:
            try:
                os.remove(fp)
            except:
                pass


def clean_text_for_tts(text):
    text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
    text = re.sub(r'#{1,6}\s*', '', text)
    text = re.sub(r'`.*?`', '', text)
    return re.sub(r'\s+', ' ', text).strip()


# Her hikaye icin bir kaynak sec (hikaye basinda belirlenir)
IMAGE_SOURCE = None  # create_storybook tarafindan set edilir

def download_image(prompt, path, index):
    global IMAGE_SOURCE
    headers = {'User-Agent': 'Mozilla/5.0'}
    clean = re.sub(r'[^a-zA-Z0-9\s,]', '', prompt)[:200]
    clean_encoded = requests.utils.quote(clean)
    seed = int(time.time()) + index

    sources = {
        "pollinations": f"https://pollinations.ai/p/{clean_encoded}?width={VIDEO_W}&height={VIDEO_H}&nologo=true&seed={seed}",
        "unsplash":     f"https://source.unsplash.com/{VIDEO_W}x{VIDEO_H}/?{clean_encoded}&sig={seed}",
        "picsum":       f"https://picsum.photos/seed/{seed+index}/{VIDEO_W}/{VIDEO_H}",
        "pixabay":      f"https://pixabay.com/get/g{seed}.jpg",  # fallback olarak kullanilir
    }

    source = IMAGE_SOURCE or "pollinations"
    url = sources.get(source, sources["pollinations"])

    try:
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f:
                f.write(r.content)
    except:
        pass

    if os.path.exists(path):
        try:
            with Image.open(path) as img:
                img = img.convert('RGB')
                iw, ih = img.size
                scale = max(VIDEO_W / iw, VIDEO_H / ih)
                nw, nh = int(iw * scale), int(ih * scale)
                img = img.resize((nw, nh), Image.LANCZOS)
                x1 = (nw - VIDEO_W) // 2
                y1 = (nh - VIDEO_H) // 2
                img = img.crop((x1, y1, x1 + VIDEO_W, y1 + VIDEO_H))
                img.save(path, "JPEG", quality=95)
            return True
        except:
            pass

    try:
        r = requests.get(f"https://picsum.photos/seed/{index}/{VIDEO_W}/{VIDEO_H}", timeout=15)
        if r.status_code == 200:
            with open(path, 'wb') as f:
                f.write(r.content)
            return True
    except:
        pass
    return False


def get_font(size):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()


def make_subtitle_image(text, img_path, out_path):
    """PIL ile altyazi eklenmiş görsel üret."""
    img = Image.open(img_path).convert('RGB')
    font = get_font(44)
    margin = 60
    lines = textwrap.wrap(text, width=60)
    line_h = 54
    pad = 20
    total_h = len(lines) * line_h + pad * 2
    box_y = VIDEO_H - total_h - 40
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle(
        [(margin - pad, box_y), (VIDEO_W - margin + pad, box_y + total_h)],
        fill=(0, 0, 0, 180)
    )
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        tx = (VIDEO_W - tw) // 2
        ty = box_y + pad + i * line_h
        draw.text((tx + 2, ty + 2), line, font=font, fill=(0, 0, 0, 200))
        draw.text((tx, ty), line, font=font, fill=(255, 255, 255, 255))
    img.save(out_path, "PNG")


def set_attr(clip, attr, value):
    for prefix in ['with_', 'set_']:
        m = f"{prefix}{attr}"
        if hasattr(clip, m):
            return getattr(clip, m)(value)
    return clip


def load_bookend(path, label):
    if not os.path.exists(path):
        print(f"⚠️ {label} bulunamadı: {path}")
        return None
    try:
        clip = VideoFileClip(path)
        if clip.size != [VIDEO_W, VIDEO_H]:
            scale = max(VIDEO_W / clip.w, VIDEO_H / clip.h)
            clip = clip.resized(scale)
            x1 = (clip.w - VIDEO_W) // 2
            y1 = (clip.h - VIDEO_H) // 2
            clip = clip.cropped(x1=x1, y1=y1, x2=x1+VIDEO_W, y2=y1+VIDEO_H)
        print(f"✅ {label}: {clip.duration:.1f}s")
        return clip
    except Exception as e:
        print(f"⚠️ {label} yüklenemedi: {e}")
        return None


def create_storybook(json_path, level=None):
    global IMAGE_SOURCE
    IMAGE_SOURCE = random.choice(["pollinations", "pollinations", "unsplash", "picsum"])
    print(f"🖼️  Resim kaynağı: {IMAGE_SOURCE}")
    cleanup_old_files(TEMP_DIR)

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs    = data['text']
    image_prompts = data.get('image_prompts', paragraphs)
    story_id      = data['id']
    level         = data.get('level', '')
    prefix        = f"{level}-" if level else ""
    output_path   = os.path.join(TEMP_DIR, f"{prefix}{story_id}.mp4")

    print(f"ℹ️ {len(paragraphs)} sahne | MoviePy | {VIDEO_W}x{VIDEO_H}@{FPS}fps")

    scenes = []

    for i, para in enumerate(paragraphs):
        if not para.strip():
            continue
        print(f"🎬 Sahne {i+1}/{len(paragraphs)}...")

        audio_path   = os.path.join(TEMP_DIR, f"{story_id}_{i}_audio.mp3")
        raw_img_path = os.path.join(TEMP_DIR, f"{story_id}_{i}_raw.jpg")
        sub_img_path = os.path.join(TEMP_DIR, f"{story_id}_{i}_sub.png")

        # TTS
        clean = clean_text_for_tts(para)
        gTTS(text=clean, lang='de').save(audio_path)
        audio = AudioFileClip(audio_path)

        # Gorsel
        prompt = image_prompts[i] if i < len(image_prompts) else para
        download_image(prompt, raw_img_path, i)
        make_subtitle_image(clean, raw_img_path, sub_img_path)

        # ImageClip — ses suresi kadar
        duration = audio.duration
        img_clip = ImageClip(sub_img_path)
        img_clip = set_attr(img_clip, 'duration', duration)
        img_clip = set_attr(img_clip, 'fps', FPS)

        # Boyut kontrolu
        if hasattr(img_clip, 'size') and list(img_clip.size) != [VIDEO_W, VIDEO_H]:
            scale = max(VIDEO_W / img_clip.w, VIDEO_H / img_clip.h)
            img_clip = img_clip.resized(scale)
            x1 = (img_clip.w - VIDEO_W) // 2
            y1 = (img_clip.h - VIDEO_H) // 2
            img_clip = img_clip.cropped(x1=x1, y1=y1, x2=x1+VIDEO_W, y2=y1+VIDEO_H)

        # Ses ve goruntüyü birleştir
        scene = set_attr(img_clip, 'audio', audio)
        scenes.append(scene)

    if not scenes:
        print("❌ Sahne oluşturulamadı.")
        return

    # Hikaye bölümü — tüm sahneler art arda
    story_part = concatenate_videoclips(scenes, method="chain")

    # Giriş / kapanış
    entrance = load_bookend(ENTRANCE_VIDEO, "Giriş")
    close    = load_bookend(CLOSE_VIDEO,    "Kapanış")

    parts = []
    if entrance:
        parts.append(entrance)
    parts.append(story_part)
    if close:
        parts.append(close)

    final = concatenate_videoclips(parts, method="chain")

    print(f"🎥 Render başlıyor: {final.duration:.1f}s toplam...")
    final.write_videofile(
        output_path,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        audio_fps=44100,
        threads=4,          # CPU çekirdek kullan
        preset="ultrafast", # Hız öncelikli
        logger=None,
    )
    print(f"✨ Tamamlandı: {output_path}")
    return output_path


if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Kullanım: python3 create_storybook.py <json_path>")