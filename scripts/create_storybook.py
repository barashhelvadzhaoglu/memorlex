import json
import os
import sys
import re
import requests
import time
from gtts import gTTS
from PIL import Image

try:
    from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip, VideoFileClip
except ImportError:
    from moviepy.editor import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip, VideoFileClip

TEMP_DIR = "temp"
RETENTION_DAYS = 3

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPTS_DIR)
ENTRANCE_VIDEO = os.path.join(PROJECT_DIR, "video", "enterence.mp4")
CLOSE_VIDEO    = os.path.join(PROJECT_DIR, "video", "close.mp4")

VIDEO_W = 1920
VIDEO_H = 1080


def cleanup_old_files(directory, days):
    if not os.path.exists(directory):
        os.makedirs(directory)
        return
    now = time.time()
    cutoff = now - (days * 86400)
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path) and os.path.getmtime(file_path) < cutoff:
            try:
                os.remove(file_path)
                print(f"🗑️ Silindi: {filename}")
            except Exception as e:
                print(f"⚠️ Silme hatası ({filename}): {e}")


def clean_text_for_tts(text: str) -> str:
    """
    gTTS icin metni temizler:
    - **bold** ve *italic* markdown'u kaldirir
    - # basliklar temizlenir
    - Fazla bosluklar kaldirilir
    """
    text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)  # **bold** *italic* ***bold-italic***
    text = re.sub(r'#{1,6}\s*', '', text)                 # # basliklar
    text = re.sub(r'`.*?`', '', text)                     # `kod`
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def download_image(prompt, path, index):
    clean_prompt = re.sub(r'[^a-zA-Z0-9\s]', '', prompt)
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

    try:
        encoded_prompt = requests.utils.quote(clean_prompt[:250])
        url = f"https://pollinations.ai/p/{encoded_prompt}?width={VIDEO_W}&height={VIDEO_H}&nologo=true&seed={int(time.time())+index}"
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(path, 'wb') as f:
                f.write(r.content)
            # Tam 1280x720 olarak kaydet, siyah bosluk kalmaz
            with Image.open(path) as img:
                img = img.convert('RGB')
                # Oranı koruyarak crop yap (fill, not fit)
                iw, ih = img.size
                scale = max(VIDEO_W / iw, VIDEO_H / ih)
                new_w = int(iw * scale)
                new_h = int(ih * scale)
                img = img.resize((new_w, new_h), Image.LANCZOS)
                left = (new_w - VIDEO_W) // 2
                top  = (new_h - VIDEO_H) // 2
                img = img.crop((left, top, left + VIDEO_W, top + VIDEO_H))
                img.save(path, "JPEG", quality=95)
            return True
    except Exception as e:
        print(f"⚠️ Görsel indirme hatası: {e}")

    try:
        fallback_url = f"https://picsum.photos/seed/{index+int(time.time())}/{VIDEO_W}/{VIDEO_H}"
        r = requests.get(fallback_url, timeout=15)
        if r.status_code == 200:
            with open(path, 'wb') as f:
                f.write(r.content)
            return True
    except:
        return False


def get_system_font():
    paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return "Arial"


def apply_effect(clip, effect_name, duration=0.5):
    method_name = f"with_{effect_name}"
    if hasattr(clip, method_name):
        return getattr(clip, method_name)(duration)
    elif hasattr(clip, effect_name):
        return getattr(clip, effect_name)(duration)
    return clip


def set_clip_attr(clip, attr_name, value):
    for prefix in ['with_', 'set_']:
        method = f"{prefix}{attr_name}"
        if hasattr(clip, method):
            return getattr(clip, method)(value)
    return clip


def load_bookend_clip(video_path, label):
    if not os.path.exists(video_path):
        print(f"⚠️ {label} bulunamadı, atlanıyor: {video_path}")
        return None
    try:
        clip = VideoFileClip(video_path)
        # Boyut farkli ise tam VIDEO_W x VIDEO_H'a getir (crop ile)
        if clip.size != (VIDEO_W, VIDEO_H):
            print(f"   ↳ Boyut düzeltiliyor: {clip.size} → ({VIDEO_W}, {VIDEO_H})")
            scale = max(VIDEO_W / clip.w, VIDEO_H / clip.h)
            clip = clip.resized(scale)
            # Crop: ortadan kes
            x1 = (clip.w - VIDEO_W) // 2
            y1 = (clip.h - VIDEO_H) // 2
            clip = clip.cropped(x1=x1, y1=y1, x2=x1 + VIDEO_W, y2=y1 + VIDEO_H)
        print(f"✅ {label} yüklendi: {os.path.basename(video_path)} ({clip.duration:.1f}s) {clip.size}")
        return clip
    except Exception as e:
        print(f"⚠️ {label} yüklenemedi ({e}), atlanıyor.")
        return None


def create_storybook(json_path):
    cleanup_old_files(TEMP_DIR, RETENTION_DAYS)

    if not os.path.exists(json_path):
        print(f"Hata: {json_path} bulunamadı.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs    = data['text']
    image_prompts = data.get('image_prompts', paragraphs)
    story_id      = data['id']
    scenes        = []

    FONT_PATH      = get_system_font()
    CROSSFADE_TIME = 1.0
    print(f"ℹ️ Font: {FONT_PATH} | Crossfade: {CROSSFADE_TIME}s | {len(paragraphs)} sahne")

    for i, para in enumerate(paragraphs):
        if not para.strip():
            continue

        print(f"🎬 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")

        audio_path = os.path.join(TEMP_DIR, f"temp_audio_{story_id}_{i}.mp3")
        img_path   = os.path.join(TEMP_DIR, f"temp_img_{story_id}_{i}.jpg")

        # TTS icin markdown temizle
        clean_para = clean_text_for_tts(para)
        gTTS(text=clean_para, lang='de').save(audio_path)
        audio_clip = AudioFileClip(audio_path)

        current_prompt = image_prompts[i] if i < len(image_prompts) else para
        download_image(current_prompt, img_path, i)

        duration = audio_clip.duration + CROSSFADE_TIME

        # Gorsel tam VIDEO_W x VIDEO_H doldursun
        bg_clip = ImageClip(img_path)
        # Boyut kontrolu — crop ile tam doldur
        if hasattr(bg_clip, 'size') and bg_clip.size != (VIDEO_W, VIDEO_H):
            scale = max(VIDEO_W / bg_clip.w, VIDEO_H / bg_clip.h)
            bg_clip = bg_clip.resized(scale)
            x1 = (bg_clip.w - VIDEO_W) // 2
            y1 = (bg_clip.h - VIDEO_H) // 2
            bg_clip = bg_clip.cropped(x1=x1, y1=y1, x2=x1 + VIDEO_W, y2=y1 + VIDEO_H)
        bg_clip = set_clip_attr(bg_clip, 'duration', duration)
        bg_clip = set_clip_attr(bg_clip, 'fps', 24)

        # Altyazi: genislik VIDEO_W - 80px margin, alt kisimda
        txt_clip = TextClip(
            text=clean_para,
            font_size=44,
            color='white',
            font=FONT_PATH,
            method='caption',
            size=(VIDEO_W - 120, None),
            text_align='center',
            bg_color=(0, 0, 0, 200),
        )
        txt_clip = set_clip_attr(txt_clip, 'duration', duration)

        # Altyazi dikey pozisyonu: alt kisim, 30px bosluk
        txt_h = txt_clip.size[1] if hasattr(txt_clip, 'size') else 80
        pos_y = VIDEO_H - txt_h - 30
        txt_clip = set_clip_attr(txt_clip, 'position', ('center', pos_y))
        txt_clip = set_clip_attr(txt_clip, 'opacity', 1.0)

        scene = CompositeVideoClip([bg_clip, txt_clip], size=(VIDEO_W, VIDEO_H))
        scene = set_clip_attr(scene, 'audio', audio_clip)
        scene = apply_effect(scene, "fadein", 0.5)
        scene = apply_effect(scene, "fadeout", 0.5)

        scenes.append(scene)

    if not scenes:
        print("❌ Hata: Sahne oluşturulamadı.")
        return

    entrance_clip = load_bookend_clip(ENTRANCE_VIDEO, "Giriş videosu")
    close_clip    = load_bookend_clip(CLOSE_VIDEO,    "Kapanış videosu")

    print(f"🎥 Birleştiriliyor — giriş={'✅' if entrance_clip else '❌'} | sahneler={len(scenes)} | kapanış={'✅' if close_clip else '❌'}")

    story_part = concatenate_videoclips(scenes, method="compose", padding=-CROSSFADE_TIME)

    final_clips = []
    if entrance_clip:
        final_clips.append(entrance_clip)
    final_clips.append(story_part)
    if close_clip:
        final_clips.append(close_clip)

    final_video = concatenate_videoclips(final_clips, method="compose")

    level = data.get("level", "")
    prefix = f"{level}-" if level else ""
    output_filename = os.path.join(TEMP_DIR, f"{prefix}{story_id}.mp4")
    final_video.write_videofile(output_filename, fps=24, codec="libx264", audio_codec="aac")
    print(f"✨ Başarıyla oluşturuldu: {output_filename}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_storybook(sys.argv[1])
    else:
        print("Lütfen bir JSON dosyası yolu belirtin.")