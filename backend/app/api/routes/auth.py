from fastapi import APIRouter, Request
from datetime import timedelta
import ipaddress

from app.core import security
from app.core.config import settings
from app.crud import user as crud_user
from app.api.deps import SessionDep

from app.models.token import Token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/device")
def auth_device(
    request: Request,
    session: SessionDep
):  
    # Get client IP address
    client_ip = request.headers.get("x-forwarded-for")
    if client_ip:
        client_ip = client_ip.split(",")[0].strip()  # In case of multiple proxies
    else:
        client_ip = request.client.host

    # Validate IP address
    try:
        ip = str(ipaddress.ip_address(client_ip))  # Normalize and ensure it's a valid IP
    except ValueError as e:
        raise ValueError(f"Collected ip, isnt an ip addres. Value={e}")

    user_create = User(ip=ip)
    user = crud_user.create_user(session, user_create)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(user.id, expires_delta=access_token_expires)

    return Token(access_token=token)
