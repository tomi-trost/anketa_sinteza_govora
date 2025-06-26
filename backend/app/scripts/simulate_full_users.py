import requests
import random
import string
import time

BASE_URL = "http://api.localhost.tiangolo.com"
HEADERS = {"Content-Type": "application/json"}

NARRATOR_NAMES = ["Jure", "Klemen", "Nataša", "Žiga"]
REVIEWS = ["verjetno sintetizirano", "verjetno naravno", "gotovo naravno"]

# Example values for enums
GENDERS = ["ženski", "moški", "ne želim se opredeliti"]
EDUCATIONS = ["osnovnošolska", "srednješolska", "višješolska", "drugo"]
DEVICES = ["telefon", "tablica", "drugo"]

NARRATOR_KNOWLEDGE = ["Glasu ne poznam", "Govorca ne poznam osebno, vem pa, kdo je", "Govorca osebno poznam"]
PREDICTIONS = ["Jure", "Klemen", "Nataša", "Žiga", "Janez", "Maja"]
COMMENTS = ["zveni znano", "nepoznam tega glasu", "nič posebnega"]

MEDIA_ROLE = ["govorec, napovedovalec, voditelj, igralec", "novinar, urednik, scenarist"]
SPEACH_ROLE = ["igralec, pripovedovalec, animator, improvizator, standup komik", "trener govora ali javnega nastopanja", "lektor, slavist, prevajalec, tolmač"]
SYNHETIC_SPEACH_ROLE = ["Sodeloval sem pri razvoju sintetizatorjev govora", "Redno poslušam sintetizirani govor", "drugo"]

def random_email():
    return f"user_{''.join(random.choices(string.ascii_lowercase, k=6))}@example.com"


def get_token():
    res = requests.post(f"{BASE_URL}/api/v1/auth/device")
    return res.json().get("access_token") if res.status_code == 200 else None


def get_audio_ids():
    res = requests.get(f"{BASE_URL}/api/v1/audio/")
    if res.status_code != 200:
        return {}
    audio_data = res.json()
    return {narrator: [clip["id"] for clip in clips] for narrator, clips in audio_data.items()}


def get_narrator_ids(token):
    headers = {"Authorization": f"Bearer {token}"}
    ids = {}
    for name in NARRATOR_NAMES:
        res = requests.get(f"{BASE_URL}/api/v1/utils/narrator/{name}", headers=headers)
        if res.status_code == 200:
            ids[name] = res.json().get("id")
    return ids


def simulate_user():
    token = get_token()
    if not token:
        print("❌ Failed to get token.")
        raise Exception("Failed to get token")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 1: register user
    payload = {
        "email": random_email(),
        "gender": random.choice(GENDERS),
        "age": random.randint(18, 70),
        "education": random.choice(EDUCATIONS),
        "education_other_input": "fakulteta za AI" if random.random() < 0.3 else None,
        "device_lable": random.choice(DEVICES),
        "device_other_input": "smart TV" if random.random() < 0.2 else None,
        "media_experience": random.choice([True, False]),
        "media_role": random.choice(MEDIA_ROLE),
        "media_other_input": "montažer" if random.random() < 0.2 else None,
        "speach_experience": random.choice([True, False]),
        "speach_role": random.choice(SPEACH_ROLE),
        "speach_other_role": "motivacijski govornik" if random.random() < 0.2 else None,
        "synthetic_speach_experience": random.choice([True, False]),
        "synthetic_speach_role": random.choice(SYNHETIC_SPEACH_ROLE),
        "synthetic_speach_other_role": "študent" if random.random() < 0.2 else None,
    }
    # Remove None fields
    payload = {k: v for k, v in payload.items() if v is not None}

    reg = requests.patch(f"{BASE_URL}/api/v1/questions/register-question", headers=headers, json=payload)
    print("✅ User registered" if reg.status_code in [200, 201] else "❌ Registration failed")
    if reg.status_code not in [200, 201]:
        raise Exception("Could not register question")

    # Step 2: audio reviews
    audio_ids = get_audio_ids()
    for narrator, ids in audio_ids.items():
        for audio_id in ids:
            review = random.choice(REVIEWS)
            r = requests.post(f"{BASE_URL}/api/v1/audio/review/{audio_id}", headers=headers, json={"review": review})
            time.sleep(0.05)

    # Step 3: narrator knowledge
    narrator_ids = get_narrator_ids(token)
    for name, nid in narrator_ids.items():
        body = {
            "knows_narrator_lable": random.choice(NARRATOR_KNOWLEDGE),
            "narrator_prediction": random.choice(PREDICTIONS),
            "comment": random.choice(COMMENTS) if random.random() < 0.8 else ""
        }
        res = requests.post(f"{BASE_URL}/api/v1/questions/narrator-knowledge/{nid}", headers=headers, json=body)
        time.sleep(0.05)


if __name__ == "__main__":
    for _ in range(10):
        simulate_user()
        time.sleep(0.2)
