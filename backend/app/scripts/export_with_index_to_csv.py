import csv
import re

from sqlmodel import Session, select
from app.core.db import engine  # replace with your actual DB engine import
from app.models import User, AudioFile, UserKnowsNarrator

from app.models.user import Gender, Education, DeviceLabel, MediaRole, SpeachRole, SyntheticSpeachRole
from app.models.narrator import KnowsNarratorLabel, Narrator
from app.models.audio_file import AudioReview

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
        header = ["id", "created_at"] + user_base_fields + audio_headers + narrator_headers

        rows = []

        for user in users:
            base_data = {
                "id": str(user.id),
                "created_at": user.created_at.isoformat() if user.created_at else ""
            }

            for field in user_base_fields:
                value = getattr(user, field)
                # Use enum map if available
                if field in enum_maps:
                    base_data[field] = enum_maps[field].get(value, "")
                else:
                    base_data[field] = value if value is not None else ""


            # Audio review (already numeric, no change)
            user_reviews = {
                review.audio.code: enum_maps["audio_review"].get(review.review, "") 
                for review in user.audio_reviews if review.audio and review.review
            }
            for code in audio_headers:
                base_data[code] = user_reviews.get(code, "")

            # Narrator knowledge
            knr_map = {knr.narrator.name: knr for knr in user.knows_narrators}
            for name in narrator_names:
                knr = knr_map.get(name)
                label = knr.knows_narrator_lable if knr else ""
                base_data[f"{name}_knows_narrator_lable"] = enum_maps["knows_narrator_lable"].get(label, "") if label else ""
                base_data[f"{name}_narrator_prediction"] = knr.narrator_prediction if knr else ""
                base_data[f"{name}_comment"] = knr.comment if knr else ""

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