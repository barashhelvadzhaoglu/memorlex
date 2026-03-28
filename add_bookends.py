"""
Mevcut videolara giris/kapanis ekleyip YouTube'a yukler.
Kullanim: python3 add_bookends.py
"""
import os
import sys
import subprocess

BASE_DIR     = "/Users/user/Documents/memorlex_yeni"
TEMP_DIR     = os.path.join(BASE_DIR, "temp")
ENTRANCE     = os.path.join(BASE_DIR, "video", "enterence.mp4")
CLOSE        = os.path.join(BASE_DIR, "video", "close.mp4")
SCRIPTS_DIR  = os.path.join(BASE_DIR, "scripts", "de")

VIDEO_W = 1920
VIDEO_H = 1080

# Islenecek videolar: (video_path, json_path)
TARGETS = [
    ("b1-storie-007.mp4", "src/data/stories/de/b1/storie-007.json"),
    ("b2-storie-001.mp4", "src/data/stories/de/b2/storie-001.json"),
    ("c1-storie-003.mp4", "src/data/stories/de/c1/storie-003.json"),
    ("storie-001.mp4",    "src/data/stories/de/a2/storie-001.json"),  # a2
]


def run(cmd):
    print(f"  $ {' '.join(cmd[:4])}...")
    subprocess.run(cmd, check=True)


def normalize(inp, out):
    run([
        "ffmpeg", "-y", "-i", inp,
        "-vf", f"scale={VIDEO_W}:{VIDEO_H}:force_original_aspect_ratio=increase,crop={VIDEO_W}:{VIDEO_H}",
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "192k",
        "-pix_fmt", "yuv420p", out, "-loglevel", "error"
    ])


def concat(parts, out):
    list_path = out.replace(".mp4", "_list.txt")
    with open(list_path, "w") as f:
        for p in parts:
            f.write(f"file '{os.path.abspath(p)}'\n")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path,
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac", "-ar", "44100", "-ac", "2", "-b:a", "192k",
        "-pix_fmt", "yuv420p", out, "-loglevel", "error"
    ])


def main():
    os.chdir(BASE_DIR)

    # Giris/kapanis normalize et (bir kez)
    entrance_norm = os.path.join(TEMP_DIR, "_entrance_norm.mp4")
    close_norm    = os.path.join(TEMP_DIR, "_close_norm.mp4")

    print("📹 Giriş videosu normalize ediliyor...")
    normalize(ENTRANCE, entrance_norm)
    print("📹 Kapanış videosu normalize ediliyor...")
    normalize(CLOSE, close_norm)

    sys.path.insert(0, SCRIPTS_DIR)
    from upload_youtube import upload_video

    for video_file, json_path in TARGETS:
        video_path = os.path.join(TEMP_DIR, video_file)
        if not os.path.exists(video_path):
            print(f"⚠️ Bulunamadı, atlanıyor: {video_file}")
            continue

        print(f"\n{'='*50}")
        print(f"🎬 İşleniyor: {video_file}")

        # Yeni dosya adi: bookend_ prefix
        name     = os.path.splitext(video_file)[0]
        out_path = os.path.join(TEMP_DIR, f"bookend_{name}.mp4")

        # Mevcut videoyu normalize et
        story_norm = os.path.join(TEMP_DIR, f"_story_norm_{name}.mp4")
        normalize(video_path, story_norm)

        # Birleştir
        print("🔗 Giriş + Video + Kapanış birleştiriliyor...")
        concat([entrance_norm, story_norm, close_norm], out_path)
        print(f"✅ Hazır: {out_path}")

        # YouTube'a yukle
        print("🚀 YouTube'a yükleniyor...")
        # JSON'daki youtubeId'yi temizle ki tekrar yuklenebilsin
        import json
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        old_id = data.get("youtubeId", "")
        data["youtubeId"] = ""
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        video_id = upload_video(out_path, json_path)
        if video_id:
            print(f"✅ Yüklendi: https://youtu.be/{video_id}")
        else:
            # Basarisiz olursa eski id'yi geri yaz
            data["youtubeId"] = old_id
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"❌ Yükleme başarısız, eski ID geri yüklendi.")

    print("\n🏁 Tamamlandı!")


if __name__ == "__main__":
    main()
