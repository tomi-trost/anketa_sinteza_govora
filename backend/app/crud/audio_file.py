from typing import Optional, List
from uuid import UUID
from sqlmodel import Session, select
from app.models.audio_file import AudioFile, AudioFileCreate, AudioFileUpdate, UserReviewAudio

# ========================= AudioFile =========================

def create_audio_file(session: Session, audio_file_create: AudioFileCreate) -> AudioFile:
    audio_file = AudioFile.model_validate(audio_file_create)
    session.add(audio_file)
    session.commit()
    session.refresh(audio_file)
    return audio_file


def get_audio_file(session: Session, audio_file_id: UUID) -> Optional[AudioFile]:
    return session.get(AudioFile, audio_file_id)


def get_all_audio_files(session: Session) -> List[AudioFile]:
    statement = select(AudioFile)
    return session.exec(statement).all()


def update_audio_file(session: Session, audio_file_id: UUID, audio_file_update: AudioFileUpdate) -> Optional[AudioFile]:
    audio_file = session.get(AudioFile, audio_file_id)
    if not audio_file:
        return None
    update_data = audio_file_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(audio_file, field, value)
    session.add(audio_file)
    session.commit()
    session.refresh(audio_file)
    return audio_file


def delete_audio_file(session: Session, audio_file_id: UUID) -> bool:
    audio_file = session.get(AudioFile, audio_file_id)
    if not audio_file:
        return False
    session.delete(audio_file)
    session.commit()
    return True


# ===================== UserReviewAudio =========================

def create_user_review(session: Session, user_review_audio: UserReviewAudio) -> UserReviewAudio:
    session.add(user_review_audio)
    session.commit()
    session.refresh(user_review_audio)
    return user_review_audio


def delete_user_review(session: Session, user_id: UUID, audio_id: UUID) -> bool:
    statement = select(UserReviewAudio).where(
        (UserReviewAudio.user_id == user_id) & (UserReviewAudio.audio_id == audio_id)
    )
    user_review_audio = session.exec(statement).first()
    if not user_review_audio:
        return False
    session.delete(user_review_audio)
    session.commit()
    return True


def get_user_review(session: Session, user_id: UUID, audio_id: UUID) -> Optional[UserReviewAudio]:
    statement = select(UserReviewAudio).where(
        (UserReviewAudio.user_id == user_id) & (UserReviewAudio.audio_id == audio_id)
    )
    return session.exec(statement).first()


def get_all_user_reviews(session: Session, user_id: UUID) -> List[UserReviewAudio]:
    statement = select(UserReviewAudio).where(UserReviewAudio.user_id == user_id)
    return session.exec(statement).all()