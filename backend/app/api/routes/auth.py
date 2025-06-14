from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from datetime import timedelta

from app.core import security
from app.core.config import settings
from app.crud import user as crud_user
from app.api.deps import SessionDep

from app.models.token import Token
from app.models.user import User

from pydantic import BaseModel, StringConstraints
from typing import Annotated

router = APIRouter(prefix="/auth", tags=["Auth"])

class DeviceAuthRequest(BaseModel):
    ip: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, to_upper=True, pattern=r'^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.|$)){4}$'
        )
    ]
    mac: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, to_upper=True, pattern=r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'
        )
    ]

@router.post("/device")
def auth_device(
    session: SessionDep, device_data: DeviceAuthRequest
):
    user = crud_user.get_by_ip_mac(session, ip=device_data.ip, mac=device_data.mac)
    if user:
        raise HTTPException(status_code=400, detail="A survey has already been submitted.")
    
    user_create = User(ip=device_data.ip, mac=device_data.mac)
    user = crud_user.create_user(session, user_create)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(user.id, expires_delta=access_token_expires)

    return Token(access_token=token)
