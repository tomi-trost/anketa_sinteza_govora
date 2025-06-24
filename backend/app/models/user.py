from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
import enum
from datetime import datetime, timezone


if TYPE_CHECKING:
    # only for type hints, not executed at runtime (avoids circular import)
    from .narrator import UserKnowsNarrator
    from .audio_file import UserReviewAudio

# from app.models import UserKnowsNarrator, UserReviewAudio

# ================== User ================== 

class Gender(str, enum.Enum):
    moski = "moški"
    zenski = "ženski"
    drugo = "ne želim se opredeliti"


class Education(str, enum.Enum):
    osnovnosolska = "osnovnošolska"
    srednjesolska = "srednješolska"
    visjesolska = "višješolska"
    visokosolska = "visokošolska (1. bolonjska stopnja)"
    univerzitetna = "univerzitetna (2. bolonjska stopnja)"
    magisterij = "magisterij znanosti"
    doktorat = "doktorat znanosti"
    drugo = "drugo"


class DeviceLabel(str, enum.Enum):
    namizni = "namizni računalnik z ločenimi zvočniki"
    prenosni = "prenosni računalnik z vgrajenimi zvočniki"
    tablica = "tablica"
    telefon = "telefon"
    slusalke = "slušalke"
    bluetooth_zvocnik = "prenosni bluetooth zvočnik"
    zvocni_sistem = "visokokakovosten zvočni sistem"
    drugo = "drugo"


class MediaRole(str, enum.Enum):
    govorec = "govorec, napovedovalec, voditelj, igralec"
    novinar = "novinar, urednik, scenarist"
    podkaster = "podkaster, vplivnež, snovalec digitalni vsebin, digitalni marketingar"
    tonski = "tonski mojster, snemalec zvoka"
    snemalec = "snemalec slike, direktor fotografije, montažer"
    reziser = "režiser, realizator, producent"
    glasbenik = "glasbenik, glasbeni producent"
    drugo = "drugo"


class SpeachRole(str, enum.Enum):
    govorec = "govorec, napovedovalec, voditelj"
    novinar = "novinar podkaster vplivnež"
    igralec = "igralec, pripovedovalec, animator, improvizator, standup komik"
    trener = "trener govora ali javnega nastopanja"
    lektor = "lektor, slavist, prevajalec, tolmač"
    pisatelj = "pisatelj, pesnik, esejist, publicist, kritik"
    ucitelj = "učitelj, predavatelj"
    pevec = "pevec, zborovodja, učitelj petja"
    logoped = "logoped, foniater"
    klicni = "delam v klicnem centru"
    drugo = "drugo"


class SyntheticSpeachRole(str, enum.Enum):
    enkrat = "Pri produkciji avdio ali avdiovizualnih vsebin sem že kdaj uporabil sintetizirani govor"
    redno = "Pri produkciji avdio ali avdiovizualnih vsebin redno uporabljam sintetizirani govor"
    razvoj = "Sodeloval sem pri razvoju sintetizatorjev govora"
    poslusam = "Redno poslušam sintetizirani govor"
    drugo = "drugo"

# --------------------------------

class UserBase(SQLModel):
    # ip: str
    # mac: str
    email: Optional[str] = None

    gender: Optional[Gender] = None
    age: Optional[int] = None
    education: Optional[Education] = None
    education_other_input: Optional[str] = None

    device_lable: Optional[DeviceLabel] = None
    device_other_input: Optional[str] = None 

    media_experience: Optional[bool] = None
    media_role: Optional[MediaRole] = None
    media_other_input: Optional[str] = None

    speach_experience: Optional[bool] = None
    speach_role: Optional[SpeachRole] = None
    speach_other_role: Optional[str] = None

    synthetic_speach_experience: Optional[bool] = None
    synthetic_speach_role: Optional[SyntheticSpeachRole] = None
    synthetic_speach_other_role: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(SQLModel):
    email: Optional[str] = None

    device_lable: Optional[DeviceLabel] = None
    device_other_input: Optional[str] = None

    gender: Optional[Gender] = None
    age: Optional[int] = None
    education: Optional[Education] = None
    education_other_input: Optional[str] = None

    media_experience: Optional[bool] = None
    media_role: Optional[MediaRole] = None
    media_other_input: Optional[str] = None

    speach_experience: Optional[bool] = None
    speach_role: Optional[SpeachRole] = None
    speach_other_role: Optional[str] = None

    synthetic_speach_experience: Optional[bool] = None
    synthetic_speach_role: Optional[SyntheticSpeachRole] = None
    synthetic_speach_other_role: Optional[str] = None


class UserOut(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True


class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    knows_narrators: List["UserKnowsNarrator"] = Relationship(back_populates="user")
    audio_reviews: List["UserReviewAudio"] = Relationship(back_populates="user")

