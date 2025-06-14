from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session
from typing import List
from uuid import UUID

from app.models.audio_file import AudioFileOut, CreateUserReviewAudio, UserReviewAudioIn
from app.crud import audio_file as crud_audio_file
from app.api.deps import SessionDep, CurrentUser

router = APIRouter(prefix="/audio", tags=["Audio Review"])


@router.get("/", response_model=List[AudioFileOut])
def list_audio_files(session: SessionDep):
    """List all audio files available for review."""
    return crud_audio_file.get_all_audio_files(session)


@router.get("/{audio_id}", response_model=AudioFileOut)
def get_audio_file(audio_id: UUID, session: SessionDep):
    """Get metadata about a specific audio file."""
    audio_file = crud_audio_file.get_audio_file(session, audio_id)
    if not audio_file:
        raise HTTPException(status_code=404, detail="Audio file not found")
    return audio_file


@router.post("/review/{audio_id}", response_class=JSONResponse)
def submit_audio_review(session: SessionDep, current_user: CurrentUser, audio_id: str, review_data: UserReviewAudioIn):
    """Submit a review for an audio file."""
    review_data_create = CreateUserReviewAudio(
        review=review_data.review,
        user_id=current_user.id,
        audio_id=audio_id
    )
    crud_audio_file.create_user_review(session, review_data_create)
    return JSONResponse(status_code=201, content={"message": "Review successfully submitted."})


