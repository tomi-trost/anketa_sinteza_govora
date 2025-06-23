from fastapi import APIRouter, HTTPException
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
    already_filled = crud_user.get_already_filled_fields(session, current_user.id, user_update)
    if already_filled:
        raise HTTPException(
            status_code=409,
            detail=f"The following fields have already been submitted: {', '.join(already_filled)}"
        )
    
    crud_user.update_user(session, current_user.id, user_update)
    return JSONResponse(status_code=201, content={"message": "Answer successfully submitted."})


@router.post("/narrator-knowledge/{narrator_id}", response_class=JSONResponse)
def submit_narrator_knowledge(session: SessionDep, current_user: CurrentUser, narrator_id: str, knowledge_data: UserKnowsNarratorIn):
    """Submit information about user's knowledge of a narrator."""
    knowlage_review = crud_narrator.get_user_knows_narrator(session, current_user.id, narrator_id)
    if knowlage_review:
        raise HTTPException(status_code=409, detail="A review for this narrator has already been submitted.")
    
    knowledge_data_create = UserKnowsNarratorCreate(
        knows_narrator_lable=knowledge_data.knows_narrator_lable,
        narrator_prediction=knowledge_data.narrator_prediction,
        comment=knowledge_data.comment,
        user_id=current_user.id,
        narrator_id=narrator_id       
    )
    crud_narrator.create_user_knows_narrator(session, knowledge_data_create)
    return JSONResponse(status_code=201, content={"message": "Narrator knowledge submitted successfully."})

