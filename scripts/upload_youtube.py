import os
import sys
import json
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request

# --- DOSYA YOLLARI YAPILANDIRMASI ---
# Scriptin nerede olduğundan bağımsız olarak projenin ana dizinini (memorlex_yeni) bulur.
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
    # Olası kimlik dosyası konumlarını kontrol et
    potential_secrets = [
        os.path.join(BASE_DIR, 'client_secret.json'),         
        os.path.join(BASE_DIR, 'scripts', 'client_secret.json'), 
        os.path.join(BASE_DIR, 'client_secrets.json')          
    ]
    
    selected_secret = next((path for path in potential_secrets if os.path.exists(path)), None)
    
    if not selected_secret:
        raise FileNotFoundError(f"\n❌ HATA: Kimlik dosyası (client_secret.json) bulunamadı!\nBaktığım yerler:\n" + "\n".join(potential_secrets))

    print(f"🔍 Kimlik Dosyası Doğrulandı: {selected_secret}")
    
    credentials = None
    # Mevcut oturumu (token.pickle) yükle
    if os.path.exists(TOKEN_PICKLE_FILE):
        with open(TOKEN_PICKLE_FILE, 'rb') as token:
            credentials = pickle.load(token)

    # Oturum yoksa veya geçersizse yenile/oluştur
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            print("🔄 Mevcut oturum yenileniyor (Refresh Token)...")
            credentials.refresh(Request())
        else:
            print(f"🔑 Yeni oturum başlatılıyor. Lütfen tarayıcıda onay verin...")
            flow = InstalledAppFlow.from_client_secrets_file(selected_secret, SCOPES)
            credentials = flow.run_local_server(port=0)
        
        # Gelecekteki kullanımlar için oturumu kaydet
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
    """Ana yükleme fonksiyonu: Videoyu gönderir, ID'yi kaydeder ve playlist'e ekler."""
    print(f"🎬 Video İşleme Alındı: {os.path.basename(video_path)}")
    
    youtube = get_authenticated_service()

    if not os.path.exists(json_path):
        print(f"❌ HATA: JSON dosyası bulunamadı: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        story_data = json.load(f)

    # Metadata Hazırlığı (Hashtag'ler JSON'dan alınır)
    level = story_data.get("level", "c1").lower()
    title = story_data.get("title", f"Lerne Deutsch - {level.upper()}")
    hashtags = story_data.get("hashtags", ["#DeutschLernen", "#LearnGerman"])
    hashtag_str = " ".join(hashtags)
    
    description = f"{story_data.get('summary', '')}\n\n{hashtag_str}"

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": [h.replace("#", "") for h in hashtags],
            "categoryId": "27" # Eğitim Kategorisi
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False
        }
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    
    print("🚀 YouTube'a yükleme işlemi başlatılıyor...")
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
    # Komut satırı argümanlarını kontrol et (Video yolu ve JSON yolu)
    if len(sys.argv) >= 3:
        v_path = os.path.abspath(sys.argv[1])
        j_path = os.path.abspath(sys.argv[2])
        upload_video(v_path, j_path)
    else:
        print("❌ HATA: Eksik argüman!")
        print("Kullanım: python3 upload_youtube.py <video_yolu> <json_yolu>")