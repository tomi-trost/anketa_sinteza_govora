from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
import enum

if TYPE_CHECKING:
    # only for type hints, not executed at runtime (avoids circular import)
    from .user import User
    from .audio_file import AudioFile


# ===== Narrator CRUD =====

class NarratorName(str, enum.Enum):
    Klemen = "Klemen"
    Jure = "Jure"
    Nataša = "Nataša"
    Žiga = "Žiga"

# -------------------------

class NarratorBase(SQLModel):
    name: NarratorName


class NarratorCreate(NarratorBase):
    pass


class NarratorOut(NarratorBase):
    id: UUID

    class Config:
        orm_mode = True


class Narrator(NarratorBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    audio_files: List["AudioFile"] = Relationship(back_populates="narrator")
    knows_by_users: List["UserKnowsNarrator"] = Relationship(back_populates="narrator")

# ===== UserKnowsNarrator CRUD =====

class KnowsNarratorLabel(str, enum.Enum):
    ne_poznam = "Glasu ne poznam"
    poznam_glas = "Glas govorca poznam iz medijev, ne vem pa, kdo je"
    poznam_kdo = "Govorca ne poznam osebno, vem pa, kdo je"
    osebno_poznam = "Govorca osebno poznam"

# ----------------------------------s

class UserKnowsNarratorBase(SQLModel):
    knows_narrator_lable: KnowsNarratorLabel
    narrator_prediction: Optional[str] = None
    comment: Optional[str] = None


class UserKnowsNarratorIn(UserKnowsNarratorBase):
    pass


class UserKnowsNarratorCreate(UserKnowsNarratorBase):
    user_id: UUID
    narrator_id: UUID


class UserKnowsNarratorUpdate(SQLModel):
    knows_narrator_lable: Optional[KnowsNarratorLabel] = None
    narrator_prediction: Optional[str] = None
    comment: Optional[str] = None


class UserKnowsNarratorOut(UserKnowsNarratorBase):
    user_id: UUID
    narrator_id: UUID

    class Config:
        orm_mode = True


class UserKnowsNarrator(UserKnowsNarratorBase, table=True):
    user_id: UUID = Field(foreign_key="user.id", primary_key=True)
    narrator_id: UUID = Field(foreign_key="narrator.id", primary_key=True)

    user: "User" = Relationship(back_populates="knows_narrators")
    narrator: Narrator = Relationship(back_populates="knows_by_users")