from fastapi import APIRouter

from app.api.routes import auth, questions, reviews

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(questions.router)
api_router.include_router(reviews.router)


