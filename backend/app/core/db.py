from sqlmodel import Session, create_engine, select
from contextlib import contextmanager

# from app.crud import user as crud_user 
from app.core.config import settings
# from app.models.user import User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    from sqlmodel import SQLModel

    from app.scripts.seed_db import seed_narrators, seed_audio_files

    # This works because the models are already imported and registered from app.models
    SQLModel.metadata.create_all(engine)

    seed_narrators(session)
    seed_audio_files(session)



@contextmanager
def get_session():
    with Session(engine) as session:
        yield session