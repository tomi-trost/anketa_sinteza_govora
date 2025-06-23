from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
import enum

if TYPE_CHECKING:
    # only for type hints, not executed at runtime (avoids circular import)
    from .narrator import Narrator
    from .user import User

from app.models import Narrator, User

# ===== TestAudioFile =====

class TestAudioFile(SQLModel):
    file_path: str


# ===== AudioFile =====

class AudioType(str, enum.Enum):
    human = "human"
    synthetic = "synthetic"

# ---------------------

class AudioFileBase(SQLModel):
    type: AudioType
    narrator_id: UUID
    code: str
    file_path: Optional[str] = None


class AudioFileIn(AudioFileBase):
    pass


class AudioFileCreate(AudioFileBase):
    pass


class AudioFileUpdate(SQLModel):
    type: Optional[AudioType] = None
    narrator_id: Optional[UUID] = None
    code: Optional[str] = None
    file_path: Optional[str] = None


class AudioFileOut(AudioFileBase):
    id: UUID

    class Config:
        orm_mode = True


class AudioFile(AudioFileBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    narrator_id: UUID = Field(foreign_key="narrator.id")

    narrator: "Narrator" = Relationship(back_populates="audio_files")
    reviewed_by_users: List["UserReviewAudio"] = Relationship(back_populates="audio")

# ===== UserReviewAudio =====

class AudioReview(str, enum.Enum):
    gotovo_sintetizirano = "gotovo sintetizirano"
    verjetno_sintetizirano = "verjetno sintetizirano"
    verjetno_naravno = "verjetno naravno"
    gotovo_naravno = "gotovo naravno"
    ne_vem = "ne vem"

# --------------------------------

class BaseUserReviewAudio(SQLModel):
    review: AudioReview

class UserReviewAudioIn(BaseUserReviewAudio):
    pass

class CreateUserReviewAudio(BaseUserReviewAudio):
    user_id: UUID
    audio_id: UUID


class UserReviewAudio(BaseUserReviewAudio, table=True):
    user_id: UUID = Field(foreign_key="user.id", primary_key=True)
    audio_id: UUID = Field(foreign_key="audiofile.id", primary_key=True)

    user: "User" = Relationship(back_populates="audio_reviews")
    audio: "AudioFile" = Relationship(back_populates="reviewed_by_users")
