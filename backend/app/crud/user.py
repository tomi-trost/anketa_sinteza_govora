from typing import Optional, List
from uuid import UUID
from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserUpdate


def create_user(session: Session, user_create: UserCreate) -> User:
    user = User.model_validate(user_create)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_user(session: Session, user_id: UUID) -> Optional[User]:
    return session.get(User, user_id)


def update_user(session: Session, user_id: UUID, user_update: UserUpdate) -> Optional[User]:
    user = session.get(User, user_id)
    if not user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user_id: UUID) -> bool:
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    return True


# def get_by_ip_mac(session: Session, ip: str, mac: str) -> Optional[User]:
#     statement = select(User).where((User.ip == ip) & (User.mac == mac))
#     return session.exec(statement).first()


def get_already_filled_fields(session: Session, user_id: UUID, user_update: UserUpdate) -> List[str]:
    user = session.get(User, user_id)
    if not user:
        raise Exception("User with this id doesn't exist")

    update_data = user_update.model_dump(exclude_unset=True)
    already_filled_fields = []

    for field, new_value in update_data.items():
        current_value = getattr(user, field, None)
        if current_value is not None:
            already_filled_fields.append(field)

    return already_filled_fields

