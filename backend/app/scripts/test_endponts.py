import requests
import random
import urllib.parse


BASE_URL = "http://api.localhost.tiangolo.com"

# Authenticate and get token
print("Requesting token from /api/v1/auth/device...")
auth_response = requests.post(f"{BASE_URL}/api/v1/auth/device")

if auth_response.status_code != 200:
    print("❌ Failed to obtain JWT token. HTTP Error:", auth_response.status_code)
    exit(1)

auth_json = auth_response.json()
jwt_token = auth_json.get("access_token")
if not jwt_token or jwt_token == "null":
    print("❌ Failed to obtain JWT token. Aborting.")
    exit(1)

print(f"✅ Got JWT token: {jwt_token}\n")
if "message" in auth_json:
    print(f'Message: {auth_json["message"]}\n')

headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}

# GET /api/v1/utils/narrator?name=Jure
print("GET /api/v1/utils/narrator/Jure")
narrator_name = "Jure"
narrator_response = requests.get(f"{BASE_URL}/api/v1/utils/narrator/{narrator_name}", headers=headers)

if narrator_response.status_code in [200, 201]:
    print("✅ Successfully fetched narrator.\n")
else:
    print("❌ Failed to fetch narrator.")
    exit(1)

narrator_data = narrator_response.json()
if "message" in narrator_data:
    print(f'Message: {narrator_data["message"]}\n')

narrator_id = narrator_data.get("id")

if not narrator_id:
    print("❌ Narrator not found.")
    exit(1)
else:
    print(f"✅ Found narrator ID: {narrator_id}\n")

# GET /api/v1/audio/ to get first audio file ID
print("GET /api/v1/audio/")
audio_list_response = requests.get(f"{BASE_URL}/api/v1/audio/")

if audio_list_response.status_code in [200, 201]:
    print("✅ Successfully fetched audio list.\n")
else:
    print("❌ Failed to fetch audio list.")
    exit(1)

audio_list_data = audio_list_response.json()

if "message" in audio_list_data:
    print(f'Message: {audio_list_data["message"]}\n')

# Flatten nested dict-of-lists structure to get first audio file
audio_file_id = None
for audio_group in audio_list_data.values():
    if isinstance(audio_group, list) and audio_group:
        first_audio = audio_group[0]
        audio_file_id = first_audio.get("id")
        break

if not audio_file_id:
    print("❌ No audio files found.")
    exit(1)

print(f"✅ First audio file ID: {audio_file_id}\n")

# PATCH /api/v1/questions/register-question
print("PATCH /api/v1/questions/register-question")
patch_payload = {
    "email": "test@example.com",
    "device_lable": "telefon",
    "gender": "ženski"
}
patch_response = requests.patch(f"{BASE_URL}/api/v1/questions/register-question", headers=headers, json=patch_payload)

patch_json = patch_response.json()
if patch_response.status_code in [200, 201]:
    print("✅ Patch request successful.")
else:
    print("❌ Patch request failed.")
if "message" in patch_json:
    print(f'Message: {patch_json["message"]}\n')

print(patch_response.text, "\n")

# POST /api/v1/questions/narrator-knowledge/{narrator_id}
print("POST /api/v1/questions/narrator-knowledge/{narrator_id}")
narrator_payload = {
    "knows_narrator_lable": "Glasu ne poznam",
    "narrator_prediction": "Janez"
}
narrator_post_response = requests.post(
    f"{BASE_URL}/api/v1/questions/narrator-knowledge/{narrator_id}",
    headers=headers,
    json=narrator_payload
)

narrator_post_json = narrator_post_response.json()
if narrator_post_response.status_code in [200, 201]:
    print("✅ Narrator knowledge post successful.")
else:
    print("❌ Narrator knowledge post failed.")
if "message" in narrator_post_json:
    print(f'Message: {narrator_post_json["message"]}\n')

print(narrator_post_response.text, "\n")

# GET /api/v1/audio/{audio_id}
print("GET /api/v1/audio/{audio_id}")
audio_detail_response = requests.get(f"{BASE_URL}/api/v1/audio/{audio_file_id}")

audio_detail_json = audio_detail_response.json()
if audio_detail_response.status_code in [200, 201]:
    print("✅ Audio detail fetched successfully.\n")
else:
    print("❌ Failed to fetch audio detail.")
if "message" in audio_detail_json:
    print(f'Message: {audio_detail_json["message"]}\n')

print(audio_detail_response.text, "\n")

# POST /api/v1/audio/review/{audio_id}
print("POST /api/v1/audio/review/{audio_id}")
review_payload = {
    "review": "gotovo naravno"
}
review_response = requests.post(
    f"{BASE_URL}/api/v1/audio/review/{audio_file_id}",
    headers=headers,
    json=review_payload
)

review_json = review_response.json()
if review_response.status_code in [200, 201]:
    print("✅ Audio review posted successfully.\n")
else:
    print("❌ Failed to post audio review.")
if "message" in review_json:
    print(f'Message: {review_json["message"]}\n')

print(review_response.text, "\n")

# GET audio file using file_path from /audio/{audio_id} response
print("GET audio file by file_path")
file_path: str = audio_detail_json.get("file_path")

if file_path:
    file_path_url = urllib.parse.quote(file_path.lstrip("/"))
    file_url = f"{BASE_URL}/{file_path_url}"
    print(f"Requesting file from: {file_url}")
    file_response = requests.get(file_url)

    if file_response.status_code in [200, 201]:
        print("✅ Audio file fetched successfully.")
    else:
        print(f"❌ Failed to fetch audio file. Status code: {file_response.status_code}")
else:
    print("❌ file_path not found in audio file details.")
