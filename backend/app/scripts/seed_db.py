import os
from pathlib import Path
from uuid import uuid4
from sqlmodel import Session, select

from app.models.narrator import NarratorName, NarratorCreate
from app.models.audio_file import AudioFileCreate, AudioFile, AudioType
from app.crud.narrator import create_narrator
from app.crud.audio_file import create_audio_file
from app.models.narrator import Narrator

STATIC_AUDIO_DIR = Path(__file__).resolve().parent.parent.parent / "static_audio"


def seed_narrators(session: Session):
    existing = session.exec(select(Narrator)).first()
    if existing:
        print("Narrators already seeded.")
        return

    print("Seeding narrators...")
    for narrator_name in NarratorName:
        narrator_in = NarratorCreate(name=narrator_name)
        create_narrator(session, narrator_in)
    print("Narrators seeded.")


def seed_audio_files(session: Session):
    existing = session.exec(select(AudioFile)).first()
    if existing:
        print("Audio files already seeded.")
        return

    print("Seeding audio files...")

    # Load all narrators from DB to map name -> id
    narrators = {n.name: n for n in session.exec(select(Narrator)).all()}

    for narrator_folder in STATIC_AUDIO_DIR.iterdir():
        if not narrator_folder.is_dir():
            continue

        narrator_key = narrator_folder.name.capitalize()
        if narrator_key not in narrators:
            print(f"Warning: narrator folder '{narrator_folder}' does not match any NarratorName enum.")
            continue

        narrator_obj = narrators[narrator_key]

        for audio_file in narrator_folder.iterdir():
            if not audio_file.is_file():
                continue

            filename = audio_file.name
            code = filename.split("-")[0].strip()
            file_path = f"/audio/{narrator_folder.name}/{filename}"
            audio_type = AudioType.synthetic if code.endswith("S") else AudioType.human
            
            audio_in = AudioFileCreate(
                type=audio_type,
                narrator_id=narrator_obj.id,
                code=code,
                file_path=file_path,
            )
            create_audio_file(session, audio_in)

            # Adds placebos into the database
            if code.endswith("SS") or code.endswith("NN"):
                audio_in = AudioFileCreate(
                    type=audio_type,
                    narrator_id=narrator_obj.id,
                    code=code+"D",
                    file_path=file_path,
                )
                create_audio_file(session, audio_in)

    print("Audio files seeded.")


def main(session: Session):
    seed_narrators(session)
    seed_audio_files(session)
