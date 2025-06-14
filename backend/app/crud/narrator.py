from typing import Optional, List
from uuid import UUID
from sqlmodel import Session, select
from app.models.narrator import (
    Narrator,
    NarratorCreate,
    NarratorOut,
    UserKnowsNarrator,
    UserKnowsNarratorCreate,
    UserKnowsNarratorUpdate,
)


# ===== Narrator CRUD =====

def create_narrator(session: Session, narrator_create: NarratorCreate) -> Narrator:
    narrator = Narrator.model_validate(narrator_create)
    session.add(narrator)
    session.commit()
    session.refresh(narrator)
    return narrator


def get_narrator(session: Session, narrator_id: UUID) -> Optional[Narrator]:
    return session.get(Narrator, narrator_id)


def update_narrator(session: Session, narrator_id: UUID, narrator_update: NarratorCreate) -> Optional[Narrator]:
    narrator = session.get(Narrator, narrator_id)
    if not narrator:
        return None
    update_data = narrator_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(narrator, field, value)
    session.add(narrator)
    session.commit()
    session.refresh(narrator)
    return narrator


def delete_narrator(session: Session, narrator_id: UUID) -> bool:
    narrator = session.get(Narrator, narrator_id)
    if not narrator:
        return False
    session.delete(narrator)
    session.commit()
    return True


# ===== UserKnowsNarrator CRUD =====

def create_user_knows_narrator(session: Session, ukn_create: UserKnowsNarratorCreate) -> UserKnowsNarrator:
    ukn = UserKnowsNarrator.model_validate(ukn_create)
    session.add(ukn)
    session.commit()
    session.refresh(ukn)
    return ukn


def get_user_knows_narrator(session: Session, user_id: UUID, narrator_id: UUID) -> Optional[UserKnowsNarrator]:
    statement = select(UserKnowsNarrator).where(
        (UserKnowsNarrator.user_id == user_id) & (UserKnowsNarrator.narrator_id == narrator_id)
    )
    return session.exec(statement).first()


def update_user_knows_narrator(
    session: Session,
    user_id: UUID,
    narrator_id: UUID,
    ukn_update: UserKnowsNarratorUpdate,
) -> Optional[UserKnowsNarrator]:
    ukn = get_user_knows_narrator(session, user_id, narrator_id)
    if not ukn:
        return None
    update_data = ukn_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ukn, field, value)
    session.add(ukn)
    session.commit()
    session.refresh(ukn)
    return ukn


def delete_user_knows_narrator(session: Session, user_id: UUID, narrator_id: UUID) -> bool:
    ukn = get_user_knows_narrator(session, user_id, narrator_id)
    if not ukn:
        return False
    session.delete(ukn)
    session.commit()
    return True


def get_all_user_knows_narrators_for_user(session: Session, user_id: UUID) -> List[UserKnowsNarrator]:
    statement = select(UserKnowsNarrator).where(UserKnowsNarrator.user_id == user_id)
    return session.exec(statement).all()
