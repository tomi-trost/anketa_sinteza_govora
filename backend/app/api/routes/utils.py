from fastapi import APIRouter, HTTPException
from typing import List

from app.models.narrator import NarratorOut, NarratorName
from app.crud import narrator as crud_narrator
from app.api.deps import SessionDep

router = APIRouter(prefix="/utils", tags=["Utils"])


@router.get("/narrators", response_model=List[NarratorOut])
def list_narrators(session: SessionDep):
    """List all narrators."""
    return crud_narrator.get_all_narrators(session)


@router.get("/narrator/{narrator_name}", response_model=NarratorOut)
def get_narrator_by_name(narrator_name: NarratorName, session: SessionDep):
    """Get a specific narrator by ID."""
    narrator = crud_narrator.get_narrator_by_name(session, narrator_name)
    if not narrator:
        raise HTTPException(status_code=404, detail="Narrator not found")
    return narrator
