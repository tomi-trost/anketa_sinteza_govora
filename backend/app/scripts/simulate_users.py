import requests
import random
import time
from faker import Faker


BASE_URL = "http://api.localhost.tiangolo.com"
fake = Faker(["sl_SI", "en_US"])


# Enums (you can adjust these to exactly match your models if needed)
GENDERS = ["moški", "ženski"]
DEVICE_LABELS = ["telefon", "računalnik", "tablica"]
KNOWS_LABELS = ["Glasu ne poznam", "Govorca osebno poznam", "Govorca ne poznam osebno, vem pa, kdo je"]
REVIEWS = ["verjetno sintetizirano", "verjetno naravno", "gotovo naravno"]

def get_token():
    response = requests.post(f"{BASE_URL}/api/v1/auth/device")
    return response.json().get("access_token")

def get_audio_data():
    response = requests.get(f"{BASE_URL}/api/v1/audio/")
    return response.json() if response.status_code == 200 else {}

def get_narrators(token):
    r = requests.get(f"{BASE_URL}/api/v1/utils/narrator/", headers={"Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        return []
    return [n["name"] for n in r.json().get("narrators", [])]

def simulate_user(idx):
    print(f"\n👤 Simulating user {idx+1}/10...")
    token = get_token()
    if not token:
        print("❌ Failed to get token.")
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    audio_data = get_audio_data()
    all_audios = [audio for group in audio_data.values() for audio in group]
    narrator_names = list(audio_data.keys())  # Assume narrator keys match narrator names

    # 1. Register user
    register_payload = {
        "email": fake.email(),
        "device_lable": random.choice(DEVICE_LABELS) if random.random() > 0.2 else None,
        "gender": random.choice(GENDERS) if random.random() > 0.1 else None
    }
    requests.patch(f"{BASE_URL}/api/v1/questions/register-question", headers=headers, json=register_payload)

    # 2. Narrator knowledge for 1-3 narrators
    for _ in range(random.randint(1, 3)):
        narrator = random.choice(narrator_names)
        # Fetch ID
        narrator_info = requests.get(f"{BASE_URL}/api/v1/utils/narrator/{narrator}", headers=headers).json()
        narrator_id = narrator_info.get("id")
        if not narrator_id:
            continue

        narrator_payload = {
            "knows_narrator_lable": random.choice(KNOWS_LABELS) if random.random() > 0.15 else None,
            "narrator_prediction": fake.first_name() if random.random() > 0.3 else "",
            "comment": fake.sentence() if random.random() > 0.7 else ""
        }
        requests.post(f"{BASE_URL}/api/v1/questions/narrator-knowledge/{narrator_id}",
                      headers=headers, json=narrator_payload)

    # 3. Submit 2–5 audio reviews
    random.shuffle(all_audios)
    for audio in all_audios[:random.randint(2, 5)]:
        audio_id = audio["id"]
        review_payload = {
            "review": random.choice(REVIEWS)
        }
        requests.post(f"{BASE_URL}/api/v1/audio/review/{audio_id}", headers=headers, json=review_payload)

    print(f"✅ User {idx+1} simulation complete.")

# Run for 10 users
for i in range(10):
    simulate_user(i)
    time.sleep(1)  # gentle delay
