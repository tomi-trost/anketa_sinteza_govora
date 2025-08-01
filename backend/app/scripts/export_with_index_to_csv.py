import csv
import re
from zoneinfo import ZoneInfo

from sqlmodel import Session, select
from app.core.db import engine 
from app.models import User, AudioFile

from app.models.user import Gender, Education, DeviceLabel, MediaRole, SpeachRole, SyntheticSpeachRole
from app.models.narrator import KnowsNarratorLabel, Narrator
from app.models.audio_file import AudioReview

question_maps = {
    "id": "Identifikator uporabnika (ni vprašanje, dodeljen avtomatsko)",
    "created_at": "Datum in čas izpolnjevanja (ni vprašanje, beleži se avtomatsko)",
    # "ip": "Uporabnikov ip naslov (ni vprašanje, beleži se avtomatsko)",
    "email": "Če želite, lahko vpišete svoj e-naslov in poslali vam bomo rezultate raziskave.",

    "gender": "Spol",
    # "age": "Starost: ________ let (vpiši)",

    "education": "Izobrazba:",
    "education_other_input": "drugo (vpiši): [v okviru vprašanja o izobrazbi]",

    "device_lable": "Na kakšni napravi poslušate?",
    "device_other_input": "drugo (vpiši): [v okviru vprašanja o napravi za poslušanje]",

    # "media_experience": "Ali se poklicno ukvarjate z elektronskimi mediji, z avdio ali avdiovizualno produkcijo?",
    "media_role": "če DA: Kakšna je vaša vloga v elektronskih medijih?",
    "media_other_input": "drugo (vpiši): [v okviru vprašanja o vlogi v medijih]",

    # "speach_experience": "Ali se poklicno ukvarjate z govorom, z glasom ali z jezikom oziroma jih pri delu izrazito uporabljate?",
    "speach_role": "če DA: Kateri je vaš poklic, ki vključuje govor, glas ali jezik?",
    "speach_other_role": "drugo (vpiši): [v okviru vprašanja o poklicu, povezanem z govorom]",

    # "synthetic_speach_experience": "Ali imate izkušnje na področju sintetiziranega govora?",
    "synthetic_speach_role": "če DA: Kakšne izkušnje imate s sintetiziranim govorom?",
    "synthetic_speach_other_role": "drugo (vpiši): [v okviru vprašanja o izkušnjah s sintetiziranim govorom]",

    "Klemen_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 1 - KLEMEN]",
    "Nataša_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 2 - NATAŠA]",
    "Jure_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 3 - JURE]",
    "Žiga_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 4 - ŽIGA]",

    "Klemen_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 1 - KLEMEN]",
    "Nataša_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 2 - NATAŠA]",
    "Jure_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 3 - JURE]",
    "Žiga_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 4 - ŽIGA]",

    "Klemen_comment": "Morebitni komentar po poslušanju [GLAS 1 - KLEMEN]",
    "Nataša_comment": "Morebitni komentar po poslušanju [GLAS 2 - NATAŠA]",
    "Jure_comment": "Morebitni komentar po poslušanju [GLAS 3 - JURE]",
    "Žiga_comment": "Morebitni komentar po poslušanju [GLAS 4 - ŽIGA]",
}

def export_question_mapping_to_csv(mapping_path="question_mapping.csv"):
    with open(mapping_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["field", "question_text"])
        for field, question in question_maps.items():
            writer.writerow([field, question])
    print(f"📄 Question mapping export successful: {mapping_path}")


# Create value-to-index maps for enums
enum_maps = {
    "gender": {e.value: i + 1 for i, e in enumerate(Gender)},
    "education": {e.value: i + 1 for i, e in enumerate(Education)},
    "device_lable": {e.value: i + 1 for i, e in enumerate(DeviceLabel)},
    "media_role": {e.value: i + 1 for i, e in enumerate(MediaRole)},
    "speach_role": {e.value: i + 1 for i, e in enumerate(SpeachRole)},
    "synthetic_speach_role": {e.value: i + 1 for i, e in enumerate(SyntheticSpeachRole)},
    "knows_narrator_lable": {e.value: i + 1 for i, e in enumerate(KnowsNarratorLabel)},
    "audio_review": {e.value: i + 1 for i, e in enumerate(AudioReview)}
}

def export_enum_mapping_to_csv(mapping_path="answer_mapping.csv"):
    with open(mapping_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["field", "value", "mapped_number"])
        for field, value_map in enum_maps.items():
            for val, num in value_map.items():
                writer.writerow([field, val, num])
            writer.writerow([])

    print(f"📄 Enum mapping export successful: {mapping_path}")

def read_code(code):
    match = re.match(r"([A-Za-z]+)(\d+)([A-Za-z]*)", code)
    if match:
        prefix, number, suffix = match.groups()
        return (prefix, int(number), suffix)
    return (code, 0, "")

def export_users_to_csv(output_path="survey_export.csv"):
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        audio_files = session.exec(select(AudioFile)).all()
        narrators = session.exec(select(Narrator)).all()

        # Order for audio voices (must match client: Klemen, Nataša, Jure, Žiga)
        voice_order = ["Klemen", "Nataša", "Jure", "Žiga"]

        # Custom sort for category 3
        def audio_sort_key(code):
            name_order = ['K', 'N', 'J', 'Z']
            custom_suffix_order = ["N", "S", "NN", "NND", "SS", "SSD"]

            letter, number, suffix = read_code(code)

            # Handle name not in name_order
            letter_index = name_order.index(letter) if letter in name_order else 99

            if number == 3 and suffix in custom_suffix_order:
                return (letter_index, number, custom_suffix_order.index(suffix))

            # Fallback: sort suffixes alphanumerically
            return (letter_index, number, suffix)

        # Sort audio codes grouped by narrator voice (from name or prefix logic)
        audio_headers = sorted(
            [audio.code for audio in audio_files],
            key=audio_sort_key
        )

        # Ensure narrator header fields are ordered: knows_label → prediction → comment
        narrator_headers = []
        for name in voice_order:
            narrator_headers += [
                f"{name}_knows_narrator_lable",
                f"{name}_narrator_prediction"
            ]
        for name in voice_order:
            narrator_headers += [
                f"{name}_comment"
            ]

        # Final header order as requested
        header = [
            # "id", "created_at", "ip", "survey_completed", "email", "gender",
            "id", "created_at", "survey_completed", "email", "gender",
            "education", "education_other_input", "device_lable", "device_other_input",
            "media_role", "media_other_input", "speach_role", "speach_other_role",
            "synthetic_speach_role", "synthetic_speach_other_role",

            # Scores
            "score_total", "score_Klemen", "score_Nataša", "score_Jure", "score_Žiga",

            # Narrator-related fields
            *narrator_headers,

            # Audio review fields (sorted accordingly)
            *audio_headers,
        ]

        rows = []

        for user in users:
            base_data = {
                "id": str(user.id),
                "created_at": user.created_at.astimezone(ZoneInfo("Europe/Ljubljana")).isoformat() if user.created_at else "",
                # "ip": str(user.ip) if user.ip else -99,
            }

            # Completion check
            reviewed_audio_codes = {
                review.audio.code for review in user.audio_reviews if review.audio and review.review is not None
            }
            survey_completed = len(reviewed_audio_codes) == len(audio_headers)
            base_data["survey_completed"] = 1 if survey_completed else -3

            # Basic user data (fields retained)
            user_fields = [
                "email", "gender",
                "education", "education_other_input",
                "device_lable", "device_other_input",
                "media_role", "media_other_input",
                "speach_role", "speach_other_role",
                "synthetic_speach_role", "synthetic_speach_other_role"
            ]
            for field in user_fields:
                value = getattr(user, field, None)

                # CONDITIONAL FIELDS (SHOWN ONLY WHEN ROLE == other)
                if field == "education_other_input":
                    if user.education == Education.drugo:
                        base_data[field] = value if value else -99
                    else:
                        base_data[field] = -2
                    continue

                if field == "device_other_input":
                    if user.device_lable == DeviceLabel.drugo:
                        base_data[field] = value if value else -99
                    else:
                        base_data[field] = -2
                    continue

                if field == "media_other_input":
                    if user.media_role == MediaRole.drugo:
                        base_data[field] = value if value else -99
                    else:
                        base_data[field] = -2
                    continue

                if field == "speach_other_input":
                    if user.speach_role == SpeachRole.drugo:
                        base_data[field] = value if value else -99
                    else:
                        base_data[field] = -2
                    continue

                if field == "synthetic_speach_other_input":
                    if user.synthetic_speach_role == SyntheticSpeachRole.drugo:
                        base_data[field] = value if value else -99
                    else:
                        base_data[field] = -2
                    continue

                if field == "email":
                    base_data[field] = value if value else -99
                    continue

                if field in enum_maps:
                    base_data[field] = enum_maps[field].get(value, -99 if value is None else value)
                else:
                    base_data[field] = value if value is not None else -99


            def score_reviews(reviews):
                score = 0
                humain = (AudioReview.verjetno_naravno, AudioReview.gotovo_naravno)
                sythetic = (AudioReview.verjetno_sintetizirano, AudioReview.gotovo_sintetizirano)

                for review in reviews:
                    if (review.review in humain and review.audio.code[2] == 'N') or \
                        (review.review in sythetic and review.audio.code[2] == 'S'):
                        score += 1
                
                return round(0 if not reviews else score/24, 3)


            # Add placeholder scores (replace with actual logic as needed)
            for name in voice_order:
                base_data[f"score_{name}"] = score_reviews([review for review in user.audio_reviews if review.audio.code.startswith('Z' if name[0].upper() == 'Ž' else name[0].upper())])
            base_data["score_total"] = round((base_data["score_Klemen"]+base_data["score_Nataša"]+base_data["score_Jure"]+base_data["score_Žiga"])/4, 3)

            # Narrator data
            knr_map = {knr.narrator.name: knr for knr in user.knows_narrators}
            for name in voice_order:
                knr = knr_map.get(name)
                base_data[f"{name}_knows_narrator_lable"] = (
                    enum_maps["knows_narrator_lable"].get(knr.knows_narrator_lable, -99)
                    if knr and knr.knows_narrator_lable else -99
                )
                base_data[f"{name}_narrator_prediction"] = (
                    knr.narrator_prediction if knr and knr.narrator_prediction else -99
                )
                base_data[f"{name}_comment"] = (
                    knr.comment if knr and knr.comment else -99
                )

            # Audio reviews
            user_reviews = {
                review.audio.code: enum_maps["audio_review"].get(review.review, -99)
                for review in user.audio_reviews if review.audio
            }
            for code in audio_headers:
                base_data[code] = user_reviews.get(code, -99)

            rows.append(base_data)

        # Export to CSV
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)

        print(f"✅ CSV export successful: {output_path}")



if __name__ == "__main__":
    export_users_to_csv(output_path="/app/exports/survey_export.csv")
    export_enum_mapping_to_csv(mapping_path="/app/exports/answer_mapping.csv")
    export_question_mapping_to_csv(mapping_path="/app/exports/qestion_mapping.csv")