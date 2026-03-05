import os
import sys
import json
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request

# --- DOSYA YOLLARI YAPILANDIRMASI ---
# Scriptin konumundan bağımsız olarak ana dizini bulur.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_PICKLE_FILE = os.path.join(BASE_DIR, 'token.pickle')

# YouTube API Kapsamları
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]

# Seviye Bazlı Playlist ID Eşleştirmesi
PLAYLIST_MAP = {
    "a1": "PLaJ-r-y5ehPX02jinpexO6QXIBBdyuo7Q",
    "a2": "PLaJ-r-y5ehPXfvZwB4fZFv2Ehymp5xfqL",
    "b1": "PLaJ-r-y5ehPVm49KkQdOnKQ2VIiuPHi6b",
    "b2": "PLaJ-r-y5ehPUghzSK1TYoXc9EcOaxKB8b",
    "c1": "PLaJ-r-y5ehPUeJyF_wMKtB1w6x7tTAIwE"
}

def get_authenticated_service():
    """Google OAuth 2.0 kimlik doğrulama sürecini yönetir."""
    potential_secrets = [
        os.path.join(BASE_DIR, 'client_secret.json'),         
        os.path.join(BASE_DIR, 'scripts', 'client_secret.json'), 
        os.path.join(BASE_DIR, 'client_secrets.json')          
    ]
    
    selected_secret = next((path for path in potential_secrets if os.path.exists(path)), None)
    
    if not selected_secret:
        raise FileNotFoundError(f"\n❌ HATA: Kimlik dosyası (client_secret.json) bulunamadı!")

    print(f"🔍 Kimlik Dosyası Doğrulandı: {selected_secret}")
    
    credentials = None
    if os.path.exists(TOKEN_PICKLE_FILE):
        with open(TOKEN_PICKLE_FILE, 'rb') as token:
            credentials = pickle.load(token)

    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            print("🔄 Mevcut oturum yenileniyor (Refresh Token)...")
            try:
                credentials.refresh(Request())
            except Exception as e:
                print(f"⚠️ Token yenileme hatası: {e}")
                credentials = None

        if not credentials:
            print(f"🔑 Yeni oturum başlatılıyor. Lütfen tarayıcıda onay verin...")
            flow = InstalledAppFlow.from_client_secrets_file(selected_secret, SCOPES)
            credentials = flow.run_local_server(port=0)
        
        with open(TOKEN_PICKLE_FILE, 'wb') as token:
            pickle.dump(credentials, token)

    return build("youtube", "v3", credentials=credentials)

def update_json_with_youtube_id(json_path, youtube_id):
    """Yüklenen videonun ID'sini ilgili hikaye JSON'una yazar."""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data['youtubeId'] = youtube_id
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"📝 JSON başarıyla güncellendi: {os.path.basename(json_path)}")
    except Exception as e:
        print(f"⚠️ JSON yazma hatası: {e}")

def add_video_to_playlist(youtube, video_id, playlist_id):
    """Videoyu seviyesine uygun playlist'e ekler."""
    try:
        request = youtube.playlistItems().insert(
            part="snippet",
            body={
                "snippet": {
                    "playlistId": playlist_id,
                    "resourceId": {
                        "kind": "youtube#video",
                        "videoId": video_id
                    }
                }
            }
        )
        request.execute()
        print(f"📂 Video playlist'e eklendi (Playlist ID: {playlist_id})")
    except Exception as e:
        print(f"⚠️ Playlist ekleme hatası: {e}")

def upload_video(video_path, json_path):
    """Ana yükleme fonksiyonu: Videoyu gönderir, dinamik link ekler ve playlist'e kaydeder."""
    print(f"🎬 Video İşleme Alındı: {os.path.basename(video_path)}")
    
    youtube = get_authenticated_service()

    if not os.path.exists(json_path):
        print(f"❌ HATA: JSON dosyası bulunamadı: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        story_data = json.load(f)

    # --- DINAMIK LINK VE METADATA HAZIRLIĞI ---
    level = story_data.get("level", "c1").lower()
    story_id = story_data.get("id", "unknown")
    title = story_data.get("title", f"Lerne Deutsch - {level.upper()}")
    
    # Link: memorlex.com/tr/german/{level}/stories/{storieid}/ (Tireleri kaldırıyoruz)
    web_story_id = story_id.replace("-", "") 
    website_link = f"https://memorlex.com/tr/german/{level}/stories/{web_story_id}/"

    # Hashtag ve Etiket (Tag) Hazırlığı
    hashtags_list = story_data.get("hashtags", ["#DeutschLernen", "#LearnGerman"])
    clean_tags = [h.replace("#", "").strip() for h in hashtags_list]
    hashtag_str = " ".join(hashtags_list)
    
    summary = story_data.get('summary', '')
    
    # --- YOUTUBE AÇIKLAMA (DESCRIPTION) ---
    description = (
        f"{hashtag_str}\n\n"
        f"📖 Bölüm Özeti: {summary}\n\n"
        f"🔗 Bu hikayedeki kelimelere ve sınav sorularına web sitemizden interaktif olarak çalışın:\n"
        f"{website_link}\n\n"
        f"Almanca öğrenmeyi Memorlex ile hızlandırın!\n"
        f"#GermanExam #DeutschLernen #Memorlex"
    )

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": clean_tags[:20],
            "categoryId": "27" # Eğitim
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False
        }
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    
    print(f"🚀 YouTube'a yükleme başlatılıyor... (Web: {website_link})")
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"⌛ Yükleme durumu: %{int(status.progress() * 100)}")

    video_id = response['id']
    print(f"✅ Yükleme Başarılı! YouTube ID: {video_id}")

    # JSON'u ve Playlist'i güncelle
    update_json_with_youtube_id(json_path, video_id)
    
    playlist_id = PLAYLIST_MAP.get(level)
    if playlist_id:
        add_video_to_playlist(youtube, video_id, playlist_id)

    return video_id

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        v_path = os.path.abspath(sys.argv[1])
        j_path = os.path.abspath(sys.argv[2])
        upload_video(v_path, j_path)
    else:
        print("❌ HATA: Eksik argüman!")
        print("Kullanım: python3 upload_youtube.py <video_yolu> <json_yolu>")