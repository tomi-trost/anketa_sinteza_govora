from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session
from typing import Dict, List
from uuid import UUID
from pathlib import Path

from app.models.audio_file import AudioFileOut, CreateUserReviewAudio, UserReviewAudioIn, TestAudioFile
from app.crud import audio_file as crud_audio_file
from app.api.deps import SessionDep, CurrentUser


router = APIRouter(prefix="/audio", tags=["Audio Review"])


@router.get("/", response_model=Dict[str, List[AudioFileOut]])
def list_audio_files(session: SessionDep):
    """List all audio files available for review."""
    all_audio_files = crud_audio_file.get_all_audio_files(session)

    # Create lookup dict from code to AudioFileOut
    audio_lookup = {audio.code: audio for audio in all_audio_files}

    # Original audio_order by code
    audio_order_codes = {
        "Klemen": [
            "K6N", "K2S", "K3SS", "K3NN", "K10N", "K3S", "K1S", "K2N", "K7S", "K8S", "K9N", "K10S",
            "K5S", "K1N", "K7N", "K9S", "K4S", "K3SSD", "K3N", "K8N", "K4N", "K6S", "K5N", "K3NND"
        ],
        "Nataša": [
            "N3SS", "N6S", "N1N", "N7N", "N3S", "N8N", "N5N", "N1S", "N9S", "N7S", "N2N", "N3NN",
            "N3SSD", "N8S", "N2S", "N10N", "N3NND", "N5S", "N3N", "N4S", "N10S", "N9N", "N6N", "N4N"
        ],
        "Jure": [
            "J6N", "J3S", "J8N", "J3SS", "J9S", "J4N", "J7S", "J3NN", "J2S", "J5N", "J1N", "J10S",
            "J6S", "J1S", "J7N", "J10N", "J3SSD", "J2N", "J4S", "J3N", "J9N", "J5S", "J8S", "J3NND"
        ],
        "Žiga": [
            "Z1N", "Z10N", "Z2S", "Z6S", "Z9N", "Z5N", "Z3NN", "Z3SS", "Z8S", "Z4S", "Z2N", "Z9S",
            "Z1S", "Z3N", "Z6N", "Z3NND", "Z7S", "Z4S", "Z10S", "Z8N", "Z5S", "Z3S", "Z3SSD", "Z4N"
        ]
    }

    # Create final dictionary with AudioFileOut objects
    ordered_audio_files = {}

    for narrator, codes in audio_order_codes.items():
        ordered_audio_files[narrator] = [audio_lookup[code] for code in codes if code in audio_lookup]

    return ordered_audio_files


@router.get("/test-filepath", response_model=TestAudioFile)
def get_audio_test_file_path():
    """Get test audio file file path."""
    return TestAudioFile(
        file_path=f"/audio/Preizkus slisnosti - Ana- 16bit 48kHz - BlackBird Sound Master - B1.wav"
    )

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
    review = crud_audio_file.get_user_review(session, current_user.id, audio_id)
    if review:
        raise HTTPException(status_code=409, detail="A review for this audio file has already been submitted.")
    
    review_data_create = CreateUserReviewAudio(
        review=review_data.review,
        user_id=current_user.id,
        audio_id=audio_id
    )
    crud_audio_file.create_user_review(session, review_data_create)
    return JSONResponse(status_code=201, content={"message": "Review successfully submitted."})


