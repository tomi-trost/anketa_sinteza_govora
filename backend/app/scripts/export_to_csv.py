import csv
import re
from sqlmodel import Session, select
from app.core.db import engine  # replace with your actual DB engine import
from app.models import User, AudioFile, UserReviewAudio, UserKnowsNarrator, Narrator

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
        narrator_names = [n.name for n in narrators]
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
                "created_at": user.created_at.isoformat(),
                **{field: getattr(user, field) for field in user_base_fields}
            }

            # Add audio reviews
            user_reviews = {review.audio.code: review.review for review in user.audio_reviews}
            for code in audio_headers:
                base_data[code] = user_reviews.get(code, "")

            # Add narrator knowledge
            knr_map = {knr.narrator.name: knr for knr in user.knows_narrators}
            for name in narrator_names:
                knr = knr_map.get(name)
                base_data[f"{name}_knows_narrator_lable"] = knr.knows_narrator_lable if knr else ""
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
    export_users_to_csv(output_path="/app/export/survey_exports.csv")