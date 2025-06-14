from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.user import UserUpdate
from app.crud import user as crud_user
from app.models.narrator import UserKnowsNarratorCreate, UserKnowsNarratorIn
from app.crud import narrator as crud_narrator

from app.api.deps import SessionDep, CurrentUser


router = APIRouter(prefix="/questions", tags=["Questions"])

@router.patch("/register-question", response_class=JSONResponse)
def register_question(session: SessionDep, current_user: CurrentUser, user_update: UserUpdate):
    """Updates the Users state with infromation of question answered."""
    crud_user.update_user(session, current_user.id, user_update)
    return JSONResponse(status_code=201, content={"message": "Divice usage information successfully submitted."})


@router.post("/narrator-knowledge/{narrator_id}", response_class=JSONResponse)
def submit_narrator_knowledge(session: SessionDep, current_user: CurrentUser, narrator_id: str, knowledge_data: UserKnowsNarratorIn):
    """Submit information about user's knowledge of a narrator."""
    knowledge_data_create = UserKnowsNarratorCreate(
        knows_narrator_lable=knowledge_data.knows_narrator_lable,
        narrator_prediction=knowledge_data.narrator_prediction,
        user_id=current_user.id,
        narrator_id=narrator_id       
    )
    crud_narrator.create_user_knows_narrator(session, knowledge_data_create)
    return JSONResponse(status_code=201, content={"message": "Narrator knowledge submitted successfully."})

