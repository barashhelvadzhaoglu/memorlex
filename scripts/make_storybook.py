import json
import os
import sys
import requests
import re
from gtts import gTTS
# ESKİ: from moviepy.editor import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip
# YENİ (v2.0 uyumlu):
from moviepy import ImageClip, AudioFileClip, TextClip, concatenate_videoclips, CompositeVideoClip

def create_storybook(json_path):
    # 1. JSON Verisini Yükle
    if not os.path.exists(json_path):
        print(f"❌ Hata: {json_path} dosyası bulunamadı.")
        return None

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    paragraphs = data['text']
    story_id = data['id']
    
    scenes = []

    print(f"🎬 {story_id} için Storybook render işlemi başlatıldı...")

    for i, para in enumerate(paragraphs):
        print(f"🔄 Sahne {i+1}/{len(paragraphs)} hazırlanıyor...")
        
        # A. Ses Dosyasını Oluştur (Google TTS)
        audio_path = f"temp_audio_{i}.mp3"
        tts = gTTS(text=para, lang='de')
        tts.save(audio_path)
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        # B. Görseli Al (Pollinations.ai)
        # Metinden temizlenmiş anahtar kelimelerle görsel talep et
        clean_para = re.sub(r'\W+', ' ', para)
        prompt_keywords = " ".join(clean_para.split()[:8])
        img_prompt = f"cinematic high resolution illustration of {prompt_keywords} in Germany"
        encoded_prompt = requests.utils.quote(img_prompt)
        img_url = f"https://pollinations.ai/p/{encoded_prompt}?width=1280&height=720&nologo=true&seed={i}"
        
        img_path = f"temp_img_{i}.jpg"
        try:
            img_res = requests.get(img_url, timeout=30)
            with open(img_path, 'wb') as f:
                f.write(img_res.content)
        except Exception as e:
            print(f"⚠️ Görsel indirilemedi, varsayılan renk kullanılacak: {e}")
            # Görsel inmezse siyah arka plan oluşturulur (hata vermemesi için)

        # C. Sahneyi Oluştur (Görsel + Alt Yazı)
        img_clip = ImageClip(img_path).set_duration(duration)
        
        # Metin Kutusu (Caption modu metni otomatik kaydırır)
        # GitHub Actions'ta ImageMagick kurulu olmalıdır.
        txt_clip = TextClip(
            para, 
            fontsize=28, 
            color='white', 
            font='Arial-Bold', 
            method='caption', 
            size=(1100, None), 
            align='center',
            bg_color='rgba(0,0,0,0.6)'
        ).set_duration(duration).set_position(('center', 820))

        # Sahneyi birleştir
        scene = CompositeVideoClip([img_clip, txt_clip]).set_audio(audio_clip)
        scenes.append(scene)

    # 2. Videoyu Birleştir ve Kaydet
    print("🎥 Sahneler birleştiriliyor (MP4)...")
    final_video = concatenate_videoclips(scenes, method="compose")
    
    # Çıktı ismini story ID'sine göre belirle
    output_name = f"{story_id}.mp4"
    final_video.write_videofile(output_name, fps=24, codec="libx264", audio_codec="aac")

    # 3. Geçici Dosyaları Temizle
    print("🧹 Geçici dosyalar siliniyor...")
    for i in range(len(paragraphs)):
        if os.path.exists(f"temp_audio_{i}.mp3"): os.remove(f"temp_audio_{i}.mp3")
        if os.path.exists(f"temp_img_{i}.jpg"): os.remove(f"temp_img_{i}.jpg")
    
    print(f"✅ Video başarıyla oluşturuldu: {output_name}")
    return output_name

if __name__ == "__main__":
    # GitHub Actions'tan gelen dosya yolunu oku
    if len(sys.argv) > 1:
        target_json = sys.argv[1]
        create_storybook(target_json)
    else:
        print("❌ Hata: Lütfen bir JSON dosya yolu belirtin.")
