import os
import sys
import json
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_PICKLE_FILE = os.path.join(BASE_DIR, 'token.pickle')

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]

PLAYLIST_MAP = {
    "a1": "PLaJ-r-y5ehPX02jinpexO6QXIBBdyuo7Q",
    "a2": "PLaJ-r-y5ehPXfvZwB4fZFv2Ehymp5xfqL",
    "b1": "PLaJ-r-y5ehPVm49KkQdOnKQ2VIiuPHi6b",
    "b2": "PLaJ-r-y5ehPUghzSK1TYoXc9EcOaxKB8b",
    "c1": "PLaJ-r-y5ehPUeJyF_wMKtB1w6x7tTAIwE"
}

def get_authenticated_service():
    potential_secrets = [
        os.path.join(BASE_DIR, 'client_secret.json'),
        os.path.join(BASE_DIR, 'scripts', 'client_secret.json'),
        os.path.join(BASE_DIR, 'client_secrets.json')
    ]
    selected_secret = next((p for p in potential_secrets if os.path.exists(p)), None)
    if not selected_secret:
        raise FileNotFoundError("❌ HATA: client_secret.json bulunamadı!")

    print(f"🔍 Kimlik Dosyası: {selected_secret}")

    credentials = None
    if os.path.exists(TOKEN_PICKLE_FILE):
        with open(TOKEN_PICKLE_FILE, 'rb') as token:
            credentials = pickle.load(token)

    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            print("🔄 Token yenileniyor...")
            try:
                credentials.refresh(Request())
            except Exception as e:
                print(f"⚠️ Token yenileme hatası: {e}")
                credentials = None

        if not credentials:
            print("🔑 Yeni oturum başlatılıyor...")
            flow = InstalledAppFlow.from_client_secrets_file(selected_secret, SCOPES)
            credentials = flow.run_local_server(port=0)

        with open(TOKEN_PICKLE_FILE, 'wb') as token:
            pickle.dump(credentials, token)

    return build("youtube", "v3", credentials=credentials)


def update_json_with_youtube_id(json_path, youtube_id):
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data['youtubeId'] = youtube_id
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"📝 JSON güncellendi: {os.path.basename(json_path)}")
    except Exception as e:
        print(f"⚠️ JSON yazma hatası: {e}")


def add_video_to_playlist(youtube, video_id, playlist_id):
    try:
        youtube.playlistItems().insert(
            part="snippet",
            body={"snippet": {"playlistId": playlist_id, "resourceId": {"kind": "youtube#video", "videoId": video_id}}}
        ).execute()
        print(f"📂 Playlist'e eklendi (ID: {playlist_id})")
    except Exception as e:
        print(f"⚠️ Playlist ekleme hatası: {e}")


def upload_video(video_path, json_path):
    print(f"🎬 Video: {os.path.basename(video_path)}")

    youtube = get_authenticated_service()

    if not os.path.exists(json_path):
        print(f"❌ JSON bulunamadı: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        story_data = json.load(f)

    # Zaten yuklenmis mi kontrol et
    existing_id = story_data.get("youtubeId", "").strip()
    if existing_id:
        print(f"⚠️ Bu hikaye zaten yüklenmiş: https://youtu.be/{existing_id}")
        print(f"   Tekrar yüklemek için JSON'daki youtubeId alanını temizleyin.")
        return existing_id

    level    = story_data.get("level", "c1").lower()
    story_id = story_data.get("id", "unknown")
    title    = story_data.get("title", f"Learn German {level.upper()}")
    summary  = story_data.get("summary", "")

    # Memorlex link
    web_story_id = story_id.replace("-", "")
    website_link = f"https://memorlex.com/en/german/{level}/stories/{web_story_id}/"

    # Hashtag listesi
    hashtags_list = story_data.get("hashtags", ["#DeutschLernen", "#LearnGerman"])
    clean_tags    = [h.replace("#", "").strip() for h in hashtags_list]
    hashtag_str   = " ".join(hashtags_list)

    # YouTube description — tamamen Ingilizce
    description = (
        f"{hashtag_str}\n\n"
        f"📖 Chapter Summary: {summary}\n\n"
        f"🔗 Study the vocabulary and quiz questions from this story interactively on our website:\n"
        f"{website_link}\n\n"
        f"Speed up your German learning with Memorlex!\n"
        f"✅ Flashcards · Reading · Listening · Comprehension Quiz\n\n"
        f"#LearnGerman #DeutschLernen #GermanLesson #Memorlex"
    )

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": clean_tags[:20],
            "categoryId": "27"  # Education
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False
        }
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    print(f"🚀 Yükleniyor... → {website_link}")

    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"⌛ %{int(status.progress() * 100)}")

    video_id = response['id']
    print(f"✅ Yükleme Başarılı! https://youtu.be/{video_id}")

    update_json_with_youtube_id(json_path, video_id)

    playlist_id = PLAYLIST_MAP.get(level)
    if playlist_id:
        add_video_to_playlist(youtube, video_id, playlist_id)

    return video_id


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        upload_video(os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]))
    else:
        print("❌ Kullanım: python3 upload_youtube.py <video_yolu> <json_yolu>")