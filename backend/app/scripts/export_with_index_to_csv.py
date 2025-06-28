import csv
import re

from sqlmodel import Session, select
from app.core.db import engine  # replace with your actual DB engine import
from app.models import User, AudioFile, UserKnowsNarrator

from app.models.user import Gender, Education, DeviceLabel, MediaRole, SpeachRole, SyntheticSpeachRole
from app.models.narrator import KnowsNarratorLabel, Narrator
from app.models.audio_file import AudioReview

question_maps = {
    "id": "Identifikator uporabnika (ni vprašanje, dodeljen avtomatsko)",
    "created_at": "Datum in čas izpolnjevanja (ni vprašanje, beleži se avtomatsko)",
    "ip": "Uporabnikov ip naslov (ni vprašanje, beleži se avtomatsko)",
    "email": "Če želite, lahko vpišete svoj e-naslov in poslali vam bomo rezultate raziskave.",

    "gender": "Spol",
    "age": "Starost: ________ let (vpiši)",

    "education": "Izobrazba:",
    "education_other_input": "drugo (vpiši): [v okviru vprašanja o izobrazbi]",

    "device_lable": "Na kakšni napravi poslušate?",
    "device_other_input": "drugo (vpiši): [v okviru vprašanja o napravi za poslušanje]",

    "media_experience": "Ali se poklicno ukvarjate z elektronskimi mediji, z avdio ali avdiovizualno produkcijo?",
    "media_role": "če DA: Kakšna je vaša vloga v elektronskih medijih?",
    "media_other_input": "drugo (vpiši): [v okviru vprašanja o vlogi v medijih]",

    "speach_experience": "Ali se poklicno ukvarjate z govorom, z glasom ali z jezikom oziroma jih pri delu izrazito uporabljate?",
    "speach_role": "če DA: Kateri je vaš poklic, ki vključuje govor, glas ali jezik?",
    "speach_other_role": "drugo (vpiši): [v okviru vprašanja o poklicu, povezanem z govorom]",

    "synthetic_speach_experience": "Ali imate izkušnje na področju sintetiziranega govora?",
    "synthetic_speach_role": "če DA: Kakšne izkušnje imate s sintetiziranim govorom?",
    "synthetic_speach_other_role": "drugo (vpiši): [v okviru vprašanja o izkušnjah s sintetiziranim govorom]",

    "Jure_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 3 - JURE]",
    "Klemen_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 1 - KLEMEN]",
    "Nataša_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 2 - NATAŠA]",
    "Žiga_knows_narrator_lable": "Ali ste prepoznali glas govorca na posnetku? [GLAS 4 - ŽIGA]",

    "Jure_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 3 - JURE]",
    "Klemen_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 1 - KLEMEN]",
    "Nataša_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 2 - NATAŠA]",
    "Žiga_narrator_prediction": "Kdo je govorec? Vpiši ime (če ga poznate) [GLAS 4 - ŽIGA]",

    "Jure_comment": "Morebitni komentar po poslušanju [GLAS 3 - JURE]",
    "Klemen_comment": "Morebitni komentar po poslušanju [GLAS 1 - KLEMEN]",
    "Nataša_comment": "Morebitni komentar po poslušanju [GLAS 2 - NATAŠA]",
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

def sort_key(code):
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

        # Create audio header fields
        audio_headers = sorted([audio.code for audio in audio_files], key=sort_key)

        # Create narrator header fields
        narrator_headers = []
        narrator_names = sorted([n.name for n in narrators if n.name])
        narrator_headers = [
            f"{name}_knows_narrator_lable" for name in narrator_names
        ] + [
            f"{name}_narrator_prediction" for name in narrator_names
        ] + [
            f"{name}_comment" for name in narrator_names
        ]

        # Prepare full header
        user_base_fields = [
            "email", "gender", "age", "education", "education_other_input",
            "device_lable", "device_other_input",
            "media_experience", "media_role", "media_other_input",
            "speach_experience", "speach_role", "speach_other_role",
            "synthetic_speach_experience", "synthetic_speach_role", "synthetic_speach_other_role"
        ]
        header = ["id", "created_at", "ip"] + user_base_fields + audio_headers + narrator_headers + ["survey_completed"]

        rows = []

        for user in users:
            base_data = {
                "id": str(user.id),
                "created_at": user.created_at.isoformat() if user.created_at else "",
                "ip": str(user.ip) if user.ip else -99,
            }

            # AUDIO REVIEW COMPLETION LOGIC
            reviewed_audio_codes = {
                review.audio.code for review in user.audio_reviews if review.audio and review.review is not None
            }
            survey_completed = len(reviewed_audio_codes) == len(audio_headers)

            for field in user_base_fields:
                value = getattr(user, field, None)

                # CONDITIONAL FIELDS (SHOWN ONLY WHEN ROLE == other)
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

                # Email is optional
                if field == "email":
                    base_data[field] = value if value else -99
                    continue

                # ENUM FIELDS
                if field in enum_maps:
                    base_data[field] = enum_maps[field].get(value, -99 if value is None else value)
                else:
                    base_data[field] = value if value is not None else -99

            # AUDIO REVIEWS
            user_reviews = {
                review.audio.code: enum_maps["audio_review"].get(review.review, -99)
                for review in user.audio_reviews if review.audio
            }
            for code in audio_headers:
                base_data[code] = user_reviews.get(code, -99)

            # NARRATOR KNOWLEDGE
            knr_map = {knr.narrator.name: knr for knr in user.knows_narrators}
            for name in narrator_names:
                knr = knr_map.get(name)
                label = knr.knows_narrator_lable if knr else None

                base_data[f"{name}_knows_narrator_lable"] = (
                    enum_maps["knows_narrator_lable"].get(label, -99) if label else -99
                )
                base_data[f"{name}_narrator_prediction"] = (
                    knr.narrator_prediction if knr and knr.narrator_prediction else -99
                )
                base_data[f"{name}_comment"] = (
                    knr.comment if knr and knr.comment else -99
                )

            # ADD SURVEY COMPLETION STATUS
            base_data["survey_completed"] = 1 if survey_completed else -3

            rows.append(base_data)


        # Write to CSV
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)

        print(f"✅ CSV export successful: {output_path}")


if __name__ == "__main__":
    export_users_to_csv(output_path="/app/exports/survey_export.csv")
    export_enum_mapping_to_csv(mapping_path="/app/exports/answer_mapping.csv")
    export_question_mapping_to_csv(mapping_path="/app/exports/qestion_mapping.csv")